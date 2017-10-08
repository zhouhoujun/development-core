/// <reference types="node" />
/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecFileOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource } from '../types';
import { ITaskContext } from '../ITaskContext';
export interface IExecFileOption extends IAssertOption {
    /**
     * the file exec run way. default parallel.
     *
     * @type {RunWay}
     * @memberof IExecFileOption
     */
    fileRunWay?: RunWay;
    args?: string[];
    /**
     * exec file options.
     *
     * @type {ExecFileOptions}
     * @memberof IExecFileOption
     */
    execFileOptions?: ExecFileOptions;
    /**
     * all child process has error.
     */
    allowError?: boolean;
}
/**
 * exec file Task
 *
 * @class ExecFileTask
 * @implements {ITask}
 */
export declare class ExecFileTask implements ITask {
    protected info: ITaskInfo;
    protected files: AsyncTaskSource;
    constructor(info: ITaskInfo, files: AsyncTaskSource);
    /**
     * get task info.
     */
    getInfo(): ITaskInfo;
    execute(ctx: ITaskContext, gulp?: Gulp): Promise<any>;
    /**
     * setup shell task.
     *
     * @param {ITaskContext} ctx
     * @param {Gulp} [gulp]
     * @returns
     *
     * @memberOf ShellTask
     */
    setup(ctx: ITaskContext, gulp?: Gulp): string;
}
