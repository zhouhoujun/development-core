/// <reference types="node" />
/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource } from '../types';
import { ITaskContext } from '../ITaskContext';
/**
 * shell option.
 *
 * @export
 * @interface IShellOption
 * @extends {IAssertOption}
 */
export interface IShellOption extends IAssertOption {
    /**
     * the shell command run way. default parallel.
     *
     * @type {RunWay}
     * @memberof IShellOption
     */
    shellRunWay?: RunWay;
    /**
     * exec options.
     *
     * @type {ExecOptions}
     * @memberof IShellOption
     */
    execOptions?: ExecOptions;
    /**
     * all child process has error.
     */
    allowError?: boolean;
}
/**
 * Shell Task
 *
 * @class ShellTask
 * @implements {ITask}
 */
export declare class ShellTask implements ITask {
    protected info: ITaskInfo;
    protected cmd: AsyncTaskSource;
    constructor(info: ITaskInfo, cmd: AsyncTaskSource);
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
