import { Gulp } from 'gulp';
import { IOperate } from './IOperate';
import { Src, TaskResult } from './types';
import { IAssertDist } from './IAssertDist';
import { ITaskContext } from './ITaskContext';
import { ITaskDecorator } from './ITaskDecorator';


/**
 * task decorator data.
 *
 * @export
 * @interface ITaskInfo
 * @extends {ITaskDecorator}
 */
export interface ITaskInfo extends ITaskDecorator {
    /**
     * finally task name.
     *
     * @type {Src}
     * @memberof ITaskInfo
     */
    taskName?: Src;

    /**
     * assert dist info.
     *
     * @type {IAssertDist}
     * @memberof ITaskInfo
     */
    assert?: IAssertDist
}

/**
 * task interface.
 *
 * @export
 * @interface ITask
 */
export interface ITask {
    /**
     * old filed.
     *
     * @type {ITaskInfo}
     * @memberof ITask
     */
    getInfo(): ITaskInfo;

    /**
     * set task info.
     *
     * @param {ITaskInfo} info
     *
     * @memberof ITask
     */
    setInfo?(info: ITaskInfo);

    /**
     * execute task works.
     *
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {Promise<any>}
     *
     * @memberOf ITask
     */
    execute?(context: ITaskContext, gulp?: Gulp): Promise<any>;

    /**
     * setup task, register to global, etc gulp.
     *
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     *
     * @memberof ITask
     */
    setup(context: ITaskContext, gulp?: Gulp): TaskResult;
}

