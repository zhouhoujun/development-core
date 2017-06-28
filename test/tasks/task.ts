import * as mocha from 'gulp-mocha';
import { Gulp } from 'gulp';
const del = require('del');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');
// const babel = require('gulp-babel');
import { IPipe, PipeTask, IAssertDist, taskdefine, createContext, IDynamicTaskOption, Operation, IAsserts, IEnvOption, ITaskContext, ITaskDefine, ITask, ITaskInfo, TaskResult, task, dynamicTask, IDynamicTasks } from '../../src';


@task({
    group: ['test', 'node']
})
export class TestTaskGA implements ITask {

    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return config.subTaskName('TestTaskGA');
    }
}
@task({
    group: ['node']
})
export class TestTaskGB implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return config.subTaskName('TestTaskGB');
    }
}


@task({
    group: ['test', 'node']
})
export class TestTaskGC implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return config.subTaskName('TestTaskGC');
    }
}
@task()
export class TestTaskA implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return;
    }
}

@task()
export class TestTaskE implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return config.subTaskName('TestTaskE');
    }
}

@task({
    group: 'pipetask'
})
export class TestPipeTask extends PipeTask {
    name = 'pipetask';
    pipes(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): IPipe[] {
        return [
            () => cache('typescript'),
            sourcemaps.init,
            tsProject
        ]
    }
}

@dynamicTask()
export class TestDynamicTask implements IDynamicTasks {
    tasks(): IDynamicTaskOption[] {
        return [
            {
                name: 'test-tscompile', src: 'src/**/*.ts', dist: 'lib',
                pipes: [() => cache('typescript'), sourcemaps.init, tsProject],
                output: [
                    (tsmap, config, dt, gulp) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                    (tsmap, config, dt, gulp) => {
                        if (config.oper & Operation.release || config.oper & Operation.deploy) {
                            return tsmap.js.pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                                .pipe(gulp.dest(config.getDist(dt)));
                        } else {
                            return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(config.getDist(dt)));
                        }
                    }
                ]
            },
            {
                name: 'test-test', src: 'test/**/*spec.ts', order: total => { console.log('total:', total); return 1 / total; },
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
    }
}


@taskdefine()
export class TaskDefine implements ITaskDefine {
    public fags = 'define';
    loadConfig(option: IAsserts, env: IEnvOption): ITaskContext {
        return createContext({
            option: option,
            env: env
        });
    }
}


@task({
    order: total => 1 / total
})
export class TestTaskB implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskB');
    }
}


@task({
    oper: Operation.build | Operation.test
})
export class TestTaskC implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskC');
    }
}

@task({
    oper: Operation.release | Operation.deploy
})
export class TestTaskD implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskD');
    }
}


@task({
    oper: Operation.build | Operation.test | Operation.watch,
})
export class TestTaskW implements ITask {
    getInfo(): ITaskInfo { return this.info; }
    constructor(private info: ITaskInfo) {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskW');
    }
}

