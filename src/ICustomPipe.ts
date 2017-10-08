import { ITransform } from './ITransform';
import { ITaskContext } from './ITaskContext';
import { IAssertDist } from './IAssertDist';
import { Gulp, TaskCallback } from 'gulp';


/**
 * custom pipe.
 *
 * @export
 * @interface ICustomPipe
 */
export interface ICustomPipe {
    /**
     * custom stream pipe.
     *
     * @param {ITransform} gulpsrc
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @param {TaskCallback} [callback]
     * @returns {(ITransform | Promise<ITransform> | void)}
     *
     * @memberof ICustomPipe
    * */
    pipe?(gulpsrc: ITransform, context: ITaskContext, dist?: IAssertDist, gulp?: Gulp, callback?: TaskCallback): ITransform | Promise<ITransform> | void;

}
