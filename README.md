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

## define task and taskdefine

 decorator not support function now, so refactor ITask interface.

 ```ts

 // module A
import {PipeTask, Pipe, IAssertDist, taskdefine, bindingConfig, Operation, ITaskOption, IEnvOption, ITaskConfig, ITaskDefine, ITask, ITaskInfo, TaskResult, task, dynamicTask, IDynamicTasks } from 'development-core';

@task({
    group: 'pipetask'
})
export class TestPipeTask extends PipeTask {
    name = 'pipetask';
    pipes(ctx: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[] {
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
    pipes(ctx: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[] {
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
                    (tsmap, ctx, dt) => tsmap.dts.pipe(gulp.dest(ctx.getDist(dt))),
                    (tsmap, ctx, dt) => {
                        if (ctx.oper & Operation.release || ctx.oper & Operation.deploy) {
                            return tsmap.js.pipe(babel({ presets: ['es2015'] }))
                                .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                                .pipe(gulp.dest(ctx.getDist(dt)));
                        } else {
                            return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(ctx.getDist(dt)));
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
            { name: 'clean', order: 0, src: 'src', dist: 'lib', task: (ctx) => del(ctx.getDist()) }
        ];
    }
}

@task
export class TestTaskX implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(ctx: ITaskConfig, gulp): TaskResult {
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
    setup(ctx: ITaskConfig, gulp): TaskResult {
        // todo...

        let taskname = ctx.subTaskName('TestTaskC');

        gulp.task(taskname, ()=>{
            gulp.src(ctx.getSrc())
                .pipe(...)
                ...
                .pipe(gulp.dest(ctx.getDist()))
        });

        // return task name, enable this task to add in run sequence.
        // or just set to decorator.
        // this.decorator.name = taskname;
        return taskname
    }
}

@taskdefine
export class TaskContext implements IContextDefine {
    getContext(config: ITaskConfig): ITaskContext {
        //todo setting config.
        return bindingConfig(config);
    }

    // load tasks
    // tasks?(context: ITaskContext): Promise<ITask[]>;
}

@taskdefine
export class TaskDefine implements ITaskDefine {
    loadConfig(option: ITaskOption, env: IEnvOption): ITaskConfig {
        //todo setting option.
        return {
            option: option,
            env: env
        };
    }
    // load tasks
    // loadTasks?(context: ITaskContext): Promise<ITask[]>;
}

```

## define task by group

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
    setup(ctx: ITaskConfig, gulp): TaskResult {
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
    setup(ctx: ITaskConfig, gulp): TaskResult {
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
    setup(ctx: ITaskConfig, gulp): TaskResult {
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
                    (tsmap, ctx, dt) => tsmap.dts.pipe(gulp.dest(ctx.getDist(dt))),
                    (tsmap, ctx, dt) => {
                        if (ctx.oper & Operation.release || ctx.oper & Operation.deploy) {
                            return tsmap.js.pipe(babel({ presets: ['es2015'] }))
                                .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                                .pipe(gulp.dest(ctx.getDist(dt)));
                        } else {
                            return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(ctx.getDist(dt)));
                        }
                    }
                ]
            }
        ]
    }
}

```

## user task, add special pipe work or add special output

special pipe work or add special output work with class implements IDynamicTasks, class extends PipeTask. also you can implements IPipeTask or ITask by youself.

```ts

// module use.
import { findTasks, bindingConfig, Operation, runTaskSequence, findTaskDefine }  from 'development-core';

let ctx = bindingConfig({
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
            ],
            output:[
                ...
            ]
        },
        //also can setting here after v0.7.11
        pipes:[
            ...
        ],
        output:[
            ...
        ]
    }
});
ctx.findTasks('module a')
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
runTaskSequence(gulp, tasks, tdfs.loadConfig({src:'src', dist:'lib'}, {watch:true}));

 ```

## Create development tool with dynamic tasks via Promise

```ts

import * as gulp from 'gulp';
import { bindingConfig, generateTask, runTaskSequence, IEnvOption, Operation } from 'development-core';
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

    let ctx = bindingConfig({
        env: env,
        option: { src: 'src', dist: 'lib' }
    });

    let tasks = ctx.generateTask([
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            oper: Operation.build,
            pipes: [
                () => cache('typescript'),
                sourcemaps.init,
                (ctx) => {
                    let transform = tsProject();
                    transform.transformSourcePipe = (source) => source.pipe(transform)['js'];
                    return transform;
                },
                (ctx) => babel({ presets: ['es2015'] }),
                (ctx) => sourcemaps.write('./sourcemaps')
            ]
        },
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            oper: Operation.release | Operation.deploy,
            pipes: [
                () => cache('typescript'), sourcemaps.init, tsProject
            ],
            output: [
                (tsmap, ctx, dt, gulp) => tsmap.dts.pipe(gulp.dest(ctx.getDist(dt))),
                (tsmap, ctx, dt, gulp) => tsmap.js.pipe(babel({ presets: ['es2015'] }))
                    .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                    .pipe(gulp.dest(ctx.getDist(dt)))
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
        { name: 'clean', order: 0, src: 'src', dist: 'lib', task: (ctx) => del(ctx.getDist()) }
    ]);

    return runTaskSequence(gulp, tasks, ctx);
}

```


https://github.com/zhouhoujun/development-core.git
The mocks are then available at `jspm_components/development-core/development-core.js`.

## Documentation

Documentation is available on the
[development-core docs site](https://github.com/zhouhoujun/development-core).

## License

MIT © [Houjun](https://github.com/zhouhoujun/)