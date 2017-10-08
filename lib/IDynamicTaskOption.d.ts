/// <reference types="gulp" />
import { IAssertDist } from './IAssertDist';
import { IPipeOption } from './IPipeOption';
import { ICustomPipe } from './ICustomPipe';
import { ITaskInfo } from './ITask';
import { TaskString, AsyncTaskSource } from './types';
import { WatchCallback, WatchEvent, Gulp } from 'gulp';
import { ITaskContext } from './ITaskContext';
import { ITransform } from './ITransform';
import { IOperate } from './IOperate';
/**
 * dynamic gulp task.
 *
 * @export
 * @interface IDynamicTaskOption
 * @extends {IAssertDist}
 */
export interface IDynamicTaskOption extends IAssertDist, IPipeOption, ICustomPipe, ITaskInfo, IOperate {
    /**
     * IAsserts extends name. for register dynamic task.
     *
     * @type {TaskName}
     * @memberof IAsserts
     */
    name: TaskString;
    /**
     * watch tasks
     *
     * @memberof IDynamicTaskOption
     */
    watchTasks?: Array<string | WatchCallback> | ((ctx?: ITaskContext, dt?: IDynamicTaskOption) => Array<string | WatchCallback>);
    /**
     * watch changed.
     *
     * @param {WatchEvent} event
     * @param {ITaskContext} context
     *
     * @memberof IDynamicTaskOption
     */
    watchChanged?(event: WatchEvent, context: ITaskContext): any;
    /**
     * custom task.
     *
     * @param {ITaskContext} context
     * @param {IDynamicTaskOption} [dt]
     * @param {Gulp} [gulp]
     * @returns {(void | ITransform | Promise<any>)}
     *
     * @memberof IDynamicTaskOption
     */
    task?(context: ITaskContext, dt?: IDynamicTaskOption, gulp?: Gulp): void | ITransform | Promise<any>;
    /**
     *  shell command task.
     *
     * @type {AsyncTaskSource}
     * @memberof IDynamicTaskOption
     */
    shell?: AsyncTaskSource;
    /**
     * exec file task.
     *
     * @type {AsyncTaskSource}
     * @memberof IDynamicTaskOption
     */
    execFiles?: AsyncTaskSource;
}
