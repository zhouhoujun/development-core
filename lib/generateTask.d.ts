import { ITaskContext } from './ITaskContext';
import { IDynamicTaskOption } from './IDynamicTaskOption';
import { ITask, ITaskInfo } from './ITask';
/**
 * dynamic build tasks.
 *
 * @export
 * @param {ITaskContext} ctx
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export declare function generateTask(ctx: ITaskContext, tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];
