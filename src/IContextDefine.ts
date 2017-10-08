import { ITaskDefine } from './ITaskDefine';
import { ITaskConfig } from './TaskConfig';
import { ITaskContext } from './ITaskContext';


/**
 * task context define.
 *
 * @export
 * @interface IContextDefine
 */
export interface IContextDefine extends ITaskDefine {
    /**
     * get context of tasks module.
     *
     * @param {ITaskConfig} config
     * @returns {ITaskContext}
     *
     * @memberof IContextDefine
     */
    getContext?(config: ITaskConfig): ITaskContext;


    /**
     * set context.
     *
     * @param {ITaskContext} config;
     * @memberof IContextDefine
     */
    setContext?(config: ITaskContext): void;

}

