/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo } from '../ITask';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';
/**
 * custom dynamic watch task.
 *
 * @class DynamicWatchTask
 * @implements {ITask}
 */
export declare class DynamicWatchTask implements ITask {
    protected info: ITaskInfo;
    protected dt: IDynamicTaskOption;
    constructor(info: ITaskInfo, dt: IDynamicTaskOption);
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
