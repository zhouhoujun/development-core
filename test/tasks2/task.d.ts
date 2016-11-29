/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { IPipe, PipeTask, IAssertDist, IDynamicTaskOption, IAsserts, IEnvOption, ITaskContext, ITaskDefine, ITask, ITaskInfo, TaskResult, IDynamicTasks } from '../../src';
export declare class TestTaskGA implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskGB implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskGC implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskA implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskE implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestPipeTask extends PipeTask {
    name: string;
    pipes(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): IPipe[];
}
export declare class TestDynamicTask implements IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}
export declare class TaskDefine implements ITaskDefine {
    fags: string;
    loadConfig(option: IAsserts, env: IEnvOption): ITaskContext;
}
export declare class TestTaskB implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskC implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskD implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
export declare class TestTaskW implements ITask {
    private info;
    getInfo(): ITaskInfo;
    constructor(info: ITaskInfo);
    setup(config: ITaskContext, gulp: any): TaskResult;
}
