/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo } from '../ITask';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';
/**
 * custom dynamic task.
 *
 * @class DynamicTask
 * @implements {ITask}
 */
export declare class DynamicTask implements ITask {
    protected info: ITaskInfo;
    protected dtp: IDynamicTaskOption;
    constructor(info: ITaskInfo, dtp: IDynamicTaskOption);
    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    getInfo(): ITaskInfo;
    execute(ctx: ITaskContext, gulp?: Gulp): Promise<any>;
    setup(ctx: ITaskContext, gulp?: Gulp): string;
}
