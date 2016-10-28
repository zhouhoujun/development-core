
import { taskdefine, bindingConfig, Operation, ITaskOption, IEnvOption, ITaskConfig, ITaskDefine, ITask, ITaskInfo, TaskResult, task } from '../../src';

@task()
export class TestTaskA implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return;
    }
}

@task()
export class TestTaskE implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...
        return 'TestTaskE';
    }
}


@taskdefine()
export class TaskDefine implements ITaskDefine {
    public fags = 'define';
    loadConfig(oper: Operation, option: ITaskOption, env: IEnvOption): ITaskConfig {
        return bindingConfig({
            oper: oper,
            option: option,
            env: env
        });
    }
}


@task({
    order: 0
})
export class TestTaskB implements ITask {
    public decorator: ITaskInfo = {};
    constructor() {
    }
    setup(config: ITaskConfig, gulp): TaskResult {
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
    setup(config: ITaskConfig, gulp): TaskResult {
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
    setup(config: ITaskConfig, gulp): TaskResult {
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
    setup(config: ITaskConfig, gulp): TaskResult {
        // todo...

        return config.subTaskName('TestTaskW');
    }
}

