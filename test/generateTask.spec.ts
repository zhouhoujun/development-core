import 'mocha';
import { expect, assert } from 'chai';

import { IDynamicTaskOption, IAsserts, Operation, ITask, Src, IEnvOption } from '../src/TaskConfig';
import { generateTask, } from '../src/generateTask';
import { toSequence, addToSequence } from '../src/taskSequence';
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
    let registerTask: ((tks: ITask[], env: IEnvOption, option?: IAsserts) => Src[]);

    beforeEach(() => {
        registerTask = (tks, env, option?: IAsserts) => {
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
                name: 'test-test', src: 'test/**/*spec.ts', order: total => 1 / total,
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
        expect(tseq.join(',')).eq('test-clean,test-test,test-tscompile,test-watch');
    });


    it('generate build test tasks with auto watch', () => {
        let tks = generateTask({
            name: 'gtest', src: 'test/**/*spec.ts', order: 1,
            oper: Operation.build | Operation.test,
            watch: true,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.test | Operation.watch });

        expect(tks.length).eq(2);

        let tseq = registerTask(tks, { release: true });
        // console.log(tseq);

        expect(tseq.join(',')).eq('');
    });

    it('generate build test tasks with auto watch', () => {
        let tks = generateTask({
            name: 'gtest', src: 'test/**/*spec.ts', order: 1,
            oper: Operation.release | Operation.test,
            watch: true,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.test | Operation.release });

        expect(tks.length).eq(1);

        let tseq = registerTask(tks, { release: true });
        // console.log(tseq);

        expect(tseq.join(',')).eq('gtest');
    });

    it('generate build tasks with auto watch', () => {
        let btks = generateTask({
            name: 'bgtest', src: 'test/**/*spec.ts', order: total => 1 / total,
            watch: true,
            oper: Operation.build,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.build | Operation.watch });

        expect(btks.length).eq(2);

        let tseq = registerTask(btks, { watch: true });
        // console.log(tseq);

        expect(tseq.join(',')).eq('bgtest,bgtest-twatch');
    });

    it('generate build tasks with auto watch with option name', () => {
        let btks = generateTask({
            name: 'bgtest', src: 'test/**/*spec.ts', order: total => 0.1,
            watch: true,
            oper: Operation.build,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.build | Operation.watch });

        expect(btks.length).eq(2);

        let tseq = registerTask(btks, { watch: true }, { watch: true, name: 'test' });
        // console.log(tseq);

        expect(tseq.join(',')).eq('test-bgtest,test-bgtest-twatch,test-bgtest-owatch');
    });


    it('one item sequence add test', () => {
        let tseq = ['test'];
        addToSequence(tseq, { taskName: 'mytest', order: tl => 1 / tl });
        expect(tseq.join(',')).eq('test,mytest');

        tseq = ['test'];
        addToSequence(tseq, { taskName: 'mytest', order: 0 });
        expect(tseq.join(',')).eq('mytest,test');
    });

    it('two item sequence add test 0', () => {
        let tseq = ['test1', 'test2'];
        addToSequence(tseq, { taskName: 'mytest', order: 0 });

        expect(tseq.join(',')).eq('mytest,test1,test2');
    });

    it('two item sequence add test 1', () => {
        let tseq = ['test1', 'test2'];
        addToSequence(tseq, { taskName: 'mytest', order: tl => 1 / tl });

        expect(tseq.join(',')).eq('test1,mytest,test2');
    });

    it('two item sequence add test 2', () => {
        let tseq = ['test1', 'test2'];
        addToSequence(tseq, { taskName: 'mytest', order: tl => 2 / tl });

        expect(tseq.join(',')).eq('test1,test2,mytest');
    });

    it('two item sequence add test 3', () => {
        let tseq = ['test1', 'test2'];
        addToSequence(tseq, { taskName: 'mytest', order: tl => 3 / tl });

        expect(tseq.join(',')).eq('test1,test2,mytest');
    });

    it('two item sequence add test 4', () => {
        let tseq = ['test1', 'test2'];
        addToSequence(tseq, { taskName: 'mytest', order: tl => 4 / tl });

        expect(tseq.join(',')).not.eq('test1,test2,mytest');
    });


    it('generate build tasks with auto watch with option name and add sequence', () => {
        let btks = generateTask({
            name: 'bgtest', src: 'test/**/*spec.ts', order: total => 0.1,
            watch: true,
            oper: Operation.build,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        }, { oper: Operation.build | Operation.watch });

        expect(btks.length).eq(2);

        let tseq = registerTask(btks, { watch: true }, { watch: true, name: 'test' });
        // console.log(tseq);

        expect(tseq.join(',')).eq('test-bgtest,test-bgtest-twatch,test-bgtest-owatch');

        addToSequence(tseq, { taskName: 'mytest', order: tl => 1 / tl });

        expect(tseq.join(',')).eq('test-bgtest,mytest,test-bgtest-twatch,test-bgtest-owatch');
    });


});


