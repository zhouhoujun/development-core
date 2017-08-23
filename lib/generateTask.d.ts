import { ITaskInfo, IDynamicTaskOption, ITaskContext, ITask } from './TaskConfig';
/**
 * dynamic build tasks.
 *
 * @export
 * @param {ITaskContext} ctx
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @param {boolean} [isDynamic]
 * @returns {ITask[]}
 */
export declare function generateTask(ctx: ITaskContext, tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo, isDynamic?: boolean): ITask[];
