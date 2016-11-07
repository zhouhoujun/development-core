// DynamicTask 
import * as gulp from 'gulp';
import { bindingConfig, currentOperation, generateTask, runTaskSequence, IEnvOption, Operation } from './src';
import * as mocha from 'gulp-mocha';
import * as minimist from 'minimist';
import * as _ from 'lodash';

const del = require('del');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('build', () => {
    var options: IEnvOption = minimist(process.argv.slice(2), {
        string: 'env',
        default: { env: process.env.NODE_ENV || 'development' }
    });
    return createTask(options);
});

let createTask = (env) => {
    let oper: Operation = currentOperation(env);
    let config = bindingConfig({
        env: env,
        oper: oper,
        option: { src: 'src', dist: 'lib' }
    });

    let tasks = config.generateTask([
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            pipes: [() => cache('typescript'), sourcemaps.init, tsProject],
            output: [
                (tsmap, config, dt, gulp) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                (tsmap, config, dt, gulp) => {
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
            oper: Operation.test | Operation.default,
            pipes: [mocha],
            output: null
        },
        { src: 'src/**/*.ts', name: 'watch', watchTasks: ['tscompile'] },
        { name: 'clean', order: 0, src: 'src', dist: 'lib', task: (config) => del(config.getDist()) }
    ]);

    return runTaskSequence(gulp, tasks, config);
}
