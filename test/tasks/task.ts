import * as mocha from 'gulp-mocha';
import { Gulp } from 'gulp';
const del = require('del');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
import { IPipe, PipeTask, IAssertDist, taskdefine, bindingConfig, IDynamicTaskOption, Operation, ITaskOption, IEnvOption, ITaskContext, ITaskDefine, ITask, ITaskDecorator, ITaskInfo, TaskResult, task, dynamicTask, IDynamicTasks } from '../../src';


@task({
    group: ['test', 'node']
})
export class TestTaskGA implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return 'TestTaskGA';
    }
}
@task({
    group: ['node']
})
export class TestTaskGB implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return 'TestTaskGB';
    }
}


@task({
    group: ['test', 'node']
})
export class TestTaskGC implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return 'TestTaskGC';
    }
}
@task
export class TestTaskA implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return;
    }
}

@task()
export class TestTaskE implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...
        return 'TestTaskE';
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

@dynamicTask
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
    }
}


@taskdefine
export class TaskDefine implements ITaskDefine {
    public fags = 'define';
    loadConfig(option: ITaskOption, env: IEnvOption): ITaskContext {
        return bindingConfig({
            option: option,
            env: env
        });
    }
}


@task({
    order: 1
})
export class TestTaskB implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
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
    public decorator: ITaskInfo = {};
    constructor() {
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
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskD');
    }
}


@task({
    oper: Operation.build | Operation.test,
    watch: true
})
export class TestTaskW implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskContext, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskW');
    }
}

