# packaged development-core

This repo is for distribution on `npm`. The source for this module is in the
[main repo](https://github.com/zhouhoujun/development-core).
Please file issues and pull requests against that repo.
This package use to develop kit for project development via gulp tasks.


`development-core`, generate gulp tasks, gulp task manager, run tasks in sequence via Promise. useful gulp task util: zipSequence, runSequence, runTaskSequence, toSequence, flattenSequence.
core of [`development-tool`](https://www.npmjs.com/package/development-tool).



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

 v.9.1: refactor order,  to set value  between 0 and 1.  to make sure right order config easy. default value 0.5;
 case order value lt than 0 will assign 0;
 case order value gt than 1, `order = (order % sequence.length) / sequence.length;`

 ```ts

 // module A
import {PipeTask, IPipe, PipeTask, IAsserts, IAssertDist, taskdefine, bindingConfig, Operation, IEnvOption, ITaskContext, ITaskDefine, ITask, ITaskInfo, TaskResult, task, dynamicTask, IDynamicTasks } from 'development-core';

@task
export class TestPipeTask implements PipeTask {
    // override
    //source(context: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>{
    //    // todo create source.
    //    // sample as:
    //    return gulp.src(context.getSrc(this.getInfo()));
    //}
    // override
    pipes(context: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[]{
        //create pipes
        return pipes
    }
    // override
    //output(context: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[]{
    //    // output pipes.
    //    return outputs;
    //}
}


@task
export class TestTaskA implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...
        return;
    }
}

@task({
    // build env task. when env.watch equals to true, auto create watch to this task.
    oper: Operation.build | Operation.autoWatch,
    order: 1, // last order.
})
export class TestTaskE implements ITask {
    private info:ITaskInfo;
    constructor() {
    }
    getInfo(): ITaskInfo { return this.info; }
    setInfo(info: ITaskInfo) { this.info = info; }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...
        return 'TestTaskE';
    }
}

@dynamicTask
export class TestDynamicTask implements IDynamicTasks {
    tasks(): IDynamicTaskOption[] {
        return [
            {
                name: 'test-tscompile', src: 'src/**/*.ts', dist: 'lib',
                // auto create watch task for this asserts when watch in context.
                watch: true,
                pipes: [() => cache('typescript'), sourcemaps.init, tsProject],
                output: [
                    (tsmap, ctx, dt, gulp) => tsmap.dts.pipe(gulp.dest(ctx.getDist(dt))),
                    (tsmap, ctx, dt, gulp) => {
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
                name: 'test-test', src: 'test/**/*spec.ts', order: total => 1 / total, //second.
                oper: Operation.test | Operation.release | Operation.deploy,
                pipe(src) {
                    return src.pipe(mocha())
                        .once('error', () => {
                            process.exit(1);
                        });
                }
            },
            //{ name: 'test-watch', src: 'src/**/*.ts', watchTasks: ['tscompile'] },
            { name: 'test-clean', order: 0, src: 'src', dist: 'lib', task: (ctx) => del(ctx.getDist()) }
        ];
    }
}


@taskdefine
export class TaskDefine implements ITaskDefine {
    public fags = 'define';
    loadConfig(option: IAsserts, env: IEnvOption): ITaskContext {
        return bindingConfig({
            option: option,
            env: env
        });
    }
}

@taskdefine
export class WebDefine implements IContextDefine {
    getContext(config: ITaskConfig): ITaskContext {
        // register default asserts.
        config.option.asserts = _.extend({
            ts: 'development-assert-ts',
            js: 'development-assert-js'
        }, config.option.asserts);


        return bindingConfig(config);
    }

    tasks(ctx: ITaskContext): Promise<ITask[]> {
        return ctx.findTasks(webTasks);
    }
}

```

## create task with order

default order value 0.5

```ts

@task({
    order: total => 1 / total // second order.
})
export class TestTaskB implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskB');
    }
}



@task({
    order: 1, // last order.
    oper: Operation.build | Operation.test
})
export class TestTaskC implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskC');
    }
}

@task({
    order: 0, //first order.
    oper: Operation.release | Operation.deploy
})
export class TestTaskD implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskD');
    }
}


@task({
    order: (total, ctx) => (ctx.oper & Operation.release)?  1 / total : 4 / total,
    oper: Operation.build | Operation.test
})
export class TestTaskW implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskW');
    }
}

// run tasks  by parallel which value is same as 0.2
@task({
    order: <IOrder> { value: 0.2, runWay: RunWay.parallel  }
})
export class TestTaskB implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskor1');
    }
}

// run this task by parallel which value is same as 0.25 and in test env.
@task({
    order: (total, ctx) => ctx.env.test ? { value: 0.25, runWay: RunWay.parallel } : 1,
})
export class TestTaskB implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(ctx: ITaskContext, gulp): TaskResult {
        // todo...

        return ctx.subTaskName('TestTaskor2');
    }
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
                // auto create watch task for this asserts when watch in context.
                watch: true,
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
    env: env,
    option: {
        src: 'src',dist: 'lib',
        loader:{
            module:'module a',
            pipes:[
                {
                    name: 'tscompile'
                    oper: Operation.build,
                    order: 0.1,
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
        option: {
            src: 'src',
            dist: 'lib',
            // auto create watch task for this asserts or special task.
            watch: true | [taskname|callback]
        }
    });

    let tasks = ctx.generateTask([
        {
            name: 'tscompile', src: 'src/**/*.ts', dist: 'lib',
            // auto create watch task for this asserts when watch in context.
            watch: true,
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