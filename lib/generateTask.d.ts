import { ITaskInfo, IDynamicTaskOption, ITaskContext, ITask } from './TaskConfig';
/**
 * dynamic build tasks.
 *
 * @export
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @param {ITaskContext} [ctx]
 * @returns {ITask[]}
 */
export declare function generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo, ctx?: ITaskContext): ITask[];
/**
 * create task by dynamic option.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
export declare function createTask(dt: IDynamicTaskOption): ITask;
