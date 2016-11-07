# packaged development-core

This repo is for distribution on `npm`. The source for this module is in the
[main repo](https://github.com/zhouhoujun/development-core).
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
import  { generateTask, runTaskSequence, runSequence } from 'development-core';

```

## run task by sequence via Promise

```ts

    runSequence('taskA', ['taskb','taskc'], 'taskd');

```

## define task and taskdefine.
 decorator not support function now, so refactor ITask interface.

 ```ts

 // module A
import {PipeTask, Pipe, IAssertDist, taskdefine, bindingConfig, Operation, ITaskOption, IEnvOption, ITaskConfig, ITaskDefine, ITask, ITaskInfo, TaskResult, task, dynamicTask, IDynamicTasks } from 'development-core';

@task({
    group: 'pipetask'
})
export class TestPipeTask extends PipeTask {
    name = 'pipetask';
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        return [
            () => cache('typescript'),
            sourcemaps.init,
            tsProject
        ]
    }
}


@task
export class TestPipeTask extends PipeTask {
    name = 'pipetask1';
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        return [
            () => cache('typescript'),
            {
                oper: Operation.build,
                toTransform: ()=> sourcemaps.init(),
            },
            tsProject
        ]
    }
}

@dynamicTask
export class TestTaskC implements IDynamicTasks {
    tasks(): IDynamicTaskOption[]{
        return [
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
    }
}

@task
export class TestTaskX implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return 'TestTaskX';
    }
}

@task({
    oper: Operation.build | Operation.test
})
export class TestTaskC implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...

        let taskname = config.subTaskName('TestTaskC');

        gulp.task(taskname, ()=>{
            gulp.src(config.getSrc())
                .pipe(...)
                ...
                .pipe(gulp.dest(config.getDist()))
        });

        // return task name, enable this task to add in run sequence.
        // or just set to decorator.
        // this.decorator.name = taskname;
        return taskname
    }
}

@taskdefine()
export class TaskDefine implements ITaskDefine {
    loadConfig(option: ITaskOption, env: IEnvOption): ITaskConfig {
        return bindingConfig({
            option: option,
            env: env
        });
    }
}

```

## define task by group.

```ts


@task({
    group: ['test', 'node']
    oper: Operation.build | Operation.test
    ...
})
export class TestTaskGA implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return 'TestTaskGA';
    }
}
@task({
    group: 'node',
    oper: Operation.build | Operation.test
    ...
})
export class TestTaskGB implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return 'TestTaskGB';
    }
}


@task({
    group: ['test', 'node'],
    oper: Operation.build | Operation.test
    ...
})
export class TestTaskGC implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return 'TestTaskGC';
    }
}

@dynamicTask({
    group: 'ts',
    oper: Operation.build | Operation.test
    ...
})
export class TestTaskC implements IDynamicTasks {
    tasks(): IDynamicTaskOption[]{
        return [
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
            }
        ]
    }
}

```

## user task, add special pipe work or add special output

```ts

// module use.
import { findTasks, bindingConfig, Operation, runTaskSequence, findTaskDefine }  from 'development-core';

let config = bindingConfig({
    env: env, oper: oper,
    option: {
        src: 'src',dist: 'lib',
        loader:{
            module:'module a',
            pipes:[
                {
                    name: 'tscompile'
                    oper: Operation.build,
                    order: 1,
                    toTransform: ()=> tslint(),
                },
            ]
        }
    }
});
config.findTasks('module a')
    .then(task =>{
        // run task;
        return runTaskSequence(gulp, tasks, tasks);
    });


 ```

## user task by task define

```ts

// module use.
import { findTasks, Operation, runTaskSequence, findTaskDefine }  from 'development-core';
let moduleA = require('module a');
let tasks = findTasks(moduleA);
let tdfs = findTaskDefine(moduleA);

// run task;
runTaskSequence(gulp, tasks, tdfs.loadConfig(Operation.build, {src:'src', dist:'lib'}, {watch:true}));

 ```

## Create development tool with dynamic tasks via Promise

```ts

import * as gulp from 'gulp';
import { bindingConfig, currentOperation, generateTask, runTaskSequence, IEnvOption, Operation } from 'development-core';
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

    let tasks = generateTask([
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
        { src: 'src/**/*.ts', name: 'watch', watchTasks: ['tscompile'] },
        { name: 'clean', order: 0, src: 'src', dist: 'lib', task: (config) => del(config.getDist()) }
    ], oper, env);

    return runTaskSequence(gulp, tasks, config);
}

```


https://github.com/zhouhoujun/development-core.git
The mocks are then available at `jspm_components/development-core/development-core.js`.

## Documentation

Documentation is available on the
[development-core docs site](https://github.com/zhouhoujun/development-core).

## License

MIT © [Houjun](https://github.com/zhouhoujun/)