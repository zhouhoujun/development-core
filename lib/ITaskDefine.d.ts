import { IEnvOption } from './IEnvOption';
import { ITaskContext } from './ITaskContext';
import { ITask } from './ITask';
import { ITaskConfig } from './TaskConfig';
import { IAssertOption } from './IAssertOption';
/**
 * custom modules task load define.
 *
 * @export
 * @interface ITaskDefine
 */
export interface ITaskDefine {
    /**
     * load config in modules
     *
     * @param {IAssertOption} option
     * @returns {ITaskContext}
     *
     * @memberof ITaskDefine
     */
    loadConfig?(option: IAssertOption, env: IEnvOption): ITaskConfig;
    /**
     * load task in modules.
     *
     * @param {ITaskContext} context
     * @param {tasksInModule} findInModule
     * @param {tasksInDir} findInDir
     * @returns {Task[]}
     *
     * @memberof ITaskDefine
     */
    loadTasks?(context: ITaskContext): Promise<ITask[]>;
    /**
     * get tasks in module.
     *
     * @param {ITaskContext} context
     * @returns {Promise<ITask[]>}
     *
     * @memberof IContextDefine
     */
    tasks?(context: ITaskContext): Promise<ITask[]>;
}
