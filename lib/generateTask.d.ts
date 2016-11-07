import { ITaskInfo, IDynamicTaskOption, ITask } from './TaskConfig';
/**
 * dynamic build tasks.
 *
 * @export
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export declare function generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];
