import { IOperate } from './IOperate';
import { ITransform } from './ITransform';
import { ITaskContext } from './ITaskContext';
import { IAssertDist } from './IAssertDist';
import { Gulp } from 'gulp';

/**
 * output pipe
 *
 * @export
 * @interface IOutputPipe
 */
export interface IOutputPipe extends IOperate {
    /**
     * output pipes
     *
     * @param {ITransform} stream
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @returns {(ITransform | Promise<ITransform>)}
     *
     * @memberof IOutputPipe
     */
    toTransform?(stream: ITransform, context: ITaskContext, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}
