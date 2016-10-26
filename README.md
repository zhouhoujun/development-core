# packaged development-core

This repo is for distribution on `npm`. The source for this module is in the
[main repo](https://github.com/zhouhoujun/development-core/src/mastert).
Please file issues and pull requests against that repo.
This package use to develop kit for project development via gulp tasks.


Development core can generate tasks, run task in sequence via Promise.


## Install

You can install this package either with `npm`.

### npm

```shell

npm install development-core

```

You can `import` modules:

## import module

```ts
import * as gulp from 'gulp';
import  { generateTask, runSequence } from 'development-core';

```

## run task by sequence via Promise

```ts

    runSequence('taskA', ['taskb','taskc'], 'taskd');

```

## Create development tool with dynamic tasks via Promise

```ts
// DynamicTask 
import * as gulp from 'gulp';
import { bindingConfig, currentOperation, generateTask, runSequence, toSequence, EnvOption, TaskOption, Src, Operation, DynamicTask } from './src/TaskConfig';
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
    var options: EnvOption = minimist(process.argv.slice(2), {
        string: 'env',
        default: { env: process.env.NODE_ENV || 'development' }
    });
    return createTask(options);
});

gulp.task('default', () => {
    gulp.start('build');
});

let createTask = (env) => {
    let oper: Operation = currentOperation(env);
    let config = bindingConfig({
        env: env,
        oper: oper,
        option: { src: 'src', dist: 'lib', loader: [] }
    });

    let taskseq = _.map(generateTask([
        { name: 'clean', src: 'src', dist: 'lib', task: (config) => del(config.getDist()) },
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            pipes: [() => cache('typescript'), sourcemaps.init, tsProject],
            output: [
                (tsmap, config, dt) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                (tsmap, config, dt) => {
                    if (config.oper === Operation.release || config.oper === Operation.deploy) {
                        return tsmap.js.pipe(babel({presets: ['es2015']}))
                            .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                            .pipe(gulp.dest(config.getDist(dt)));
                    } else {
                        return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(config.getDist(dt)));
                    }
                }
            ]
        },
        {
            name: 'test', src: 'test/**/*spec.ts',
            oper: Operation.test | Operation.release | Operation.deploy,
            pipe(src) {
                return src.pipe(mocha())
                    .once('error', () => {
                        process.exit(1);
                    });
            }
        },
        { src: 'src/**/*.ts', name: 'watch', watch: ['tscompile'] }
    ], oper, env), tk => {
        return tk(gulp, config);
    });

    return runSequence(gulp, toSequence(taskseq, oper));
}

```


https://github.com/zhouhoujun/development-core.git
The mocks are then available at `jspm_components/development-core/development-core.js`.

## Documentation

Documentation is available on the
[development-core docs site](https://github.com/zhouhoujun/development-core).

## License

MIT © [Houjun](https://github.com/zhouhoujun/)