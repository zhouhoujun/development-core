import 'mocha';
import { expect, assert } from 'chai';

import { IDynamicTask, Operation, Task, Src, IEnvOption } from '../src/TaskConfig';
import { generateTask, } from '../src/generateTask';
import { toSequence } from '../src/runSequence';
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

    let tasks: IDynamicTask[];
    let registerTask: ((tks: Task[], oper: Operation, env: IEnvOption) => Src[]);

    beforeEach(() => {
        registerTask = (tks, oper, env) => {
            let config = bindingConfig({
                env: env,
                oper: oper,
                option: { src: 'src', dist: 'lib' }
            });
            let taskseq = toSequence(_.map(tks, tk => {
                return tk(gulp, config);
            }), config.oper);
            return taskseq;
        }
        tasks = [
            {
                name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
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
                name: 'test', src: 'test/**/*spec.ts', order: 1,
                oper: Operation.test | Operation.release | Operation.deploy,
                pipe(src) {
                    return src.pipe(mocha())
                        .once('error', () => {
                            process.exit(1);
                        });
                }
            },
            { src: 'src/**/*.ts', name: 'watch', watch: ['tscompile'] },
            { name: 'clean', order: 0, src: 'src', dist: 'lib', task: (config) => del(config.getDist()) }
        ];
    })

    it('generate build tasks', () => {
        let tks = generateTask(tasks, Operation.build, { });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(2);

        let tseq = registerTask(tks, Operation.build, {});

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(2);
        expect(tseq[0]).to.eq('clean');
    });


    it('generate build tasks with watch', () => {
        let tks = generateTask(tasks, Operation.build, { watch: true });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(3);

        let tseq = registerTask(tks, Operation.build, { watch: true });

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(3);
        expect(tseq[0]).to.eq('clean');
        expect(tseq[2]).to.eq('watch');
    });

    it('generate test tasks', () => {
        let tks = generateTask(tasks, Operation.test, { watch: true });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(4);

        let tseq = registerTask(tks, Operation.test, { watch: true });

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(4);
        expect(tseq[0]).to.eq('clean');
        expect(tseq[1]).to.eq('test');
        expect(tseq[3]).to.eq('watch');
    });

    it('generate release tasks', () => {
        let tks = generateTask(tasks, Operation.release, { watch: true });

        expect(tks).to.not.null;
        expect(tks).to.not.undefined;
        expect(tks.length).to.equals(4);

        let tseq = registerTask(tks, Operation.release, { watch: true });

        expect(tseq).to.not.null;
        expect(tseq.length).to.eq(4);
        expect(tseq[0]).to.eq('clean');
        expect(tseq[1]).to.eq('test');
        expect(tseq[3]).to.eq('watch');
    });

});
