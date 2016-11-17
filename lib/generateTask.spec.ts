import 'mocha';
import { expect, assert } from 'chai';

import { IDynamicTaskOption, TaskOption, Operation, ITask, Src, IEnvOption } from '../src/TaskConfig';
import { generateTask, } from '../src/generateTask';
import { toSequence } from '../src/taskSequence';
import { bindingConfig } from '../src/bindingConfig';
let root = __dirname;

import * as path from 'path';
import * as mocha from 'gulp-mocha';
import * as _ from 'lodash';

const del = require('del');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
import * as gulp from 'gulp';

describe('generateTask', () => {

    let tasks: IDynamicTaskOption[];
    let registerTask: ((tks: ITask[], env: IEnvOption, option?: TaskOption) => Src[]);

    beforeEach(() => {
        registerTask = (tks, env, option?: TaskOption) => {
            let config = bindingConfig({
                env: env,
                option: _.extend({ src: 'src', dist: 'lib' }, option || {})
            });
            let taskseq = toSequence(gulp, tks, config);
            return taskseq;
        }
        tasks = [
            {
                name: 'test-tscompile', src: 'src/**/*.ts', dist: 'lib',
                pipes: [() => cache('typescript'), sourcemaps.init, tsProject],
                output: [
                    (tsmap, config, dt) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                    (tsmap, config, dt) => {
                        if (config.oper === Operation.release || config.oper === Operation.deploy) {
                            return tsmap.js.pipe(babel({ presets: ['es2015'] }))
                                .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                                .pipe(gulp.dest(config.getDist(dt)));
                        } else {
                            return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(config.getDist(dt)));
                        }
                    }
                ]
            },
            {
                name: 'test-test', src: 'test/**/*spec.ts', order: 1,
                oper: Operation.test | Operation.release | Operation.deploy,
                pipe(src) {
                    return src.pipe(mocha())
                        .once('error', () => {
                            process.exit(1);
                        });
                }
            },
            { name: 'test-watch', src: 'src/**/*.ts', watchTasks: ['tscompile'] },
            { name: 'test-clean', order: 0, src: 'src', dist: 'lib', task: (config) => del(config.getDist()) }
        ];
    })

    it('generate build tasks', () => {
        let tks = generateTask(tasks, { oper: Operation.build });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(2);

        let tseq = registerTask(tks, {});
        // console.log(tseq);

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(2);
        expect(tseq[0]).to.eq('test-clean');
    });


    it('generate build tasks with watch', () => {
        let tks = generateTask(tasks, { oper: Operation.build | Operation.watch });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(3);

        let tseq = registerTask(tks, { watch: true });
        // console.log(tseq);

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(3);
        expect(tseq[0]).to.eq('test-clean');
        expect(tseq[2]).to.eq('test-watch');
    });

    it('generate test tasks', () => {
        let tks = generateTask(tasks, { oper: Operation.test | Operation.watch });

        expect(tks.length).to.equals(3);

        let tseq = registerTask(tks, { watch: true, test: true });
        // console.log(tseq);

        expect(tseq.join(',')).eq('test-clean,test-tscompile,test-watch');
    });

    it('generate release tasks', () => {
        let tks = generateTask(tasks, { oper: Operation.release | Operation.watch });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(4);

        let tseq = registerTask(tks, { watch: true, release: true });
        // console.log(tseq);

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(4);
        expect(tseq[0]).to.eq('test-clean');
        expect(tseq[1]).to.eq('test-test');
        expect(tseq[3]).to.eq('test-watch');
    });


    it('generate tasks with auto watch', () => {
        let tks = generateTask({
            name: 'test', src: 'test/**/*spec.ts', order: 1,
            oper: Operation.test | Operation.build,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.test | Operation.watch });

        // expect(tks.length).to.equals(2);

        let tseq = registerTask(tks, { watch: true, test: true }, { src: 'src', dist: 'lib', watch: true });
        // console.log(tseq);

        expect(tseq.join(',')).eq('test,test-watch');
    });


});
