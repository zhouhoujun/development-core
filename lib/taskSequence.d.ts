/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { Src, RunWay, ITaskInfo, ITaskContext, ITask } from './TaskConfig';
export declare type ZipTaskName = (name: string, runWay?: RunWay, ctx?: ITaskContext) => string;
/**
 * convert setup task result to run sequence src.
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {Src[]}
 */
export declare function toSequence(gulp: Gulp, tasks: ITask[], ctx: ITaskContext, zipName?: ZipTaskName): Src[];
/**
 * generate watch task for sequence
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {(str: string) => boolean} [express]
 * @param {ZipTaskName} [zipName]
 * @returns {string}
 */
export declare function taskSequenceWatch(gulp: Gulp, tasks: Src[], ctx: ITaskContext, express?: (str: string) => boolean, zipName?: ZipTaskName): string;
/**
 * zip tasks to a single task.
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {string}
 */
export declare function zipSequence(gulp: Gulp, tasks: Src[], ctx: ITaskContext, zipName?: ZipTaskName): string;
/**
 * flatten task Sequence.
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {string[]}
 */
export declare function flattenSequence(gulp: Gulp, tasks: Src[], ctx: ITaskContext, zipName?: ZipTaskName): string[];
/**
 * add task to task sequence.
 *
 * @export
 * @param {Src[]} taskSequence
 * @param {ITaskInfo} rst
 * @param {ITaskContext} [ctx]
 * @returns {Src[]}
 */
export declare function addToSequence(taskSequence: Src[], rst: ITaskInfo, ctx?: ITaskContext): Src[];
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
 * @param {ZipTaskName} [zipName]
 * @returns {Promise<any>}
 */
export declare function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, ctx: ITaskContext, zipName?: ZipTaskName): Promise<any>;
