import { IEnvOption } from './IEnvOption';
import { RunWay } from './RunWay';
import { Src, Order, TaskOperation } from './types';
import { IAssertOption } from './IAssertOption';
import { ITaskInfo } from './ITask';
import { ITaskContext } from './ITaskContext';




/**
 * task config. runtime task config for setup task.
 *
 * @export
 * @interface ITaskConfig
 */
export interface ITaskConfig {
    /**
     * custom global data cache.
     */
    globals?: any;
    /**
     * env
     *
     * @type {EnvOption}
     * @memberof ITaskConfig
     */
    env?: IEnvOption;

    /**
     * Operation
     *
     * @type {TaskOperation}
     * @memberof ITaskConfig
     */
    oper?: TaskOperation;
    /**
     * task option setting.
     *
     * @type {IAsserts}
     * @memberof ITaskConfig
     */
    option?: IAssertOption;

    /**
     * add task result to task sequence. default implement in bindingConfig.
     *
     * @param {Src[]} sequence  task sequence.
     * @param {ITaskInfo} task
     * @returns {Src[]}
     *
     * @memberof ITaskConfig
     */
    addToSequence?(sequence: Src[], task: ITaskInfo): Src[];

    /**
     * custom config run tasks sequence in.
     *
     * @param {Src[]} [tasks]
     * @param {ITaskInfo} [assertTasks]
     * @param {ITaskInfo} [subGroupTask]
     * @returns {Src[]}
     *
     * @memberof ITaskContext
     */
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];

    /**
     * custom print help.
     *
     * @param {string} lang
     *
     * @memberof ITaskContext
     */
    printHelp?(lang: string): void;

    /**
     * package filename.
     *
     * @type {string}
     * @memberof ITaskConfig
     */
    packageFile?: string;
    /**
     * custom context factory.
     *
     * @param {ITaskConfig} cfg
     * @param {ITaskContext} [parent]
     * @returns {ITaskContext}
     *
     * @memberof ITaskConfig
     */
    createContext?(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;

}

