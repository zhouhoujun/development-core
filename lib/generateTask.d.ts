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
/**
 * create task by dynamic option.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
export declare function createTask(dt: IDynamicTaskOption): ITask;
