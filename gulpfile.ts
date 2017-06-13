// DynamicTask 
import * as gulp from 'gulp';
import { createContext, IEnvOption, Operation } from './src';
import * as mocha from 'gulp-mocha';
import * as minimist from 'minimist';
import * as _ from 'lodash';

const del = require('del');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');

gulp.task('build', () => {
    var options: IEnvOption = minimist(process.argv.slice(2), {
        string: 'env',
        default: { env: process.env.NODE_ENV || 'development' }
    });
    return createTask(options);
});

let createTask = (env) => {
    env.root = __dirname;
    let context = createContext({
        env: env,
        option: { src: 'src', dist: 'lib', buildDist: 'build' }
    });

    console.log(context);

    let tasks = context.generateTask([
        // {
        //     name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
        //     pipes: [() => cache('typescript'), () => sourcemaps.init(), () => tsProject()],
        //     output: [
        //         {
        //             oper: Operation.release | Operation.deploy,
        //             toTransform: (tsmap, config, dt, gulp) => {
        //                 console.log('ouput dts file.')
        //                 return tsmap.dts.pipe(gulp.dest(config.getDist(dt)));
        //             }
        //         },
        //         {
        //             oper: Operation.release | Operation.deploy,
        //             toTransform: (tsmap, config, dt, gulp) => {
        //                 console.log('ouput js file. release------------');
        //                 return tsmap.js.pipe(babel({ presets: ['es2015'] }))
        //                     .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
        //                     .pipe(gulp.dest(config.getDist(dt)));
        //             }
        //         },
        //         {
        //             oper: Operation.build,
        //             toTransform: (tsmap, config, dt, gulp) => {
        //                 console.log('ouput js file.')
        //                 return tsmap.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(config.getDist(dt)));
        //             }
        //         }
        //     ]
        // },
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            oper: Operation.build,
            pipes: [
                () => cache('typescript'),
                sourcemaps.init,
                (config) => {
                    let transform = tsProject();
                    transform.transformSourcePipe = (source) => source.pipe(transform)['js'];
                    return transform;
                },
                (config) => sourcemaps.write('./sourcemaps')
            ]
        },
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            oper: Operation.release | Operation.deploy,
            pipes: [
                () => cache('typescript'),
                sourcemaps.init,
                (config) => tsProject()
            ],
            output: [
                (tsmap, config, dt, gulp) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                (tsmap, config, dt, gulp) => tsmap.js
                    .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                    .pipe(gulp.dest(config.getDist(dt)))
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

    return context.runTaskSequence(tasks);
}
