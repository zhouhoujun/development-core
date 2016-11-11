/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { Src, ITaskInfo, ITaskContext, ITask } from './TaskConfig';
/**
 * convert setup task result to run sequence src.
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskConfig} config
 * @returns {Src[]}
 */
export declare function toSequence(gulp: Gulp, tasks: ITask[], config: ITaskContext): Src[];
/**
 * add task to task sequence.
 *
 * @export
 * @param {Src[]} taskSequence
 * @param {ITaskInfo} rst
 * @returns
 */
export declare function addToSequence(taskSequence: Src[], rst: ITaskInfo): (string | string[])[];
/**
 * run task sequence.
 *
 * @protected
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @returns {Promise<any>}
 *
 * @memberOf Development
 */
export declare function runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
/**
 * run task sequence
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[] | Promise<ITask[]>} tasks
 * @param {TaskConfig} config
 * @returns {Promise<any>}
 */
export declare function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, config: ITaskContext): Promise<any>;
