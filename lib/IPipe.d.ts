/// <reference types="gulp" />
import { ITaskContext } from './ITaskContext';
import { IOperate } from './IOperate';
import { TaskString } from './types';
import { IAssertDist } from './IAssertDist';
import { Gulp } from 'gulp';
import { ITransform } from './ITransform';
/**
 * pipe work
 *
 * @export
 * @interface IPipe
 */
export interface IPipe extends IOperate {
    /**
     * the pipe for some task with named as the taskName.
     *
     * @type {TaskString}
     * @memberof IPipe
     */
    taskName?: TaskString;
    /**
     * transform to pipe work
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @returns {(ITransform | Promise<ITransform>)}
     *
     * @memberof IPipe
     */
    toTransform?(context: ITaskContext, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
    /**
     * transform to pipe work
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @returns {(ITransform | Promise<ITransform>)}
     * @memberof IPipe
     */
    pipe?(context: ITaskContext, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}
