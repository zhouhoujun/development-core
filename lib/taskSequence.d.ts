/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { Src, ITaskInfo, ITaskContext, ITask } from './TaskConfig';
/**
 * convert setup task result to run sequence src.
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskContext} ctx
 * @returns {Src[]}
 */
export declare function toSequence(gulp: Gulp, tasks: ITask[], ctx: ITaskContext): Src[];
/**
 * generate watch task for sequence
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {(str: string) => boolean} [express]
 * @returns
 */
export declare function taskSequenceWatch(gulp: Gulp, tasks: Src[], ctx: ITaskContext, express?: (str: string) => boolean): string;
/**
 * zip tasks to a single task.
 *
 * @export
 * @param {Gulp} gulp
 * @param {string[]} tasks tasks sequence
 * @param {ITaskContext} ctx
 * @returns {string}
 */
export declare function zipTask(gulp: Gulp, tasks: Src[], ctx: ITaskContext): string;
/**
 * flatten task Sequence.
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @returns {string[]}
 */
export declare function flattenSequence(gulp: Gulp, tasks: Src[], ctx: ITaskContext): string[];
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
 * @param {(ITask[] | Promise<ITask[]>)} tasks
 * @param {ITaskContext} ctx
 * @returns {Promise<any>}
 */
export declare function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, ctx: ITaskContext): Promise<any>;
