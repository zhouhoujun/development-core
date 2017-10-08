import { ICustomPipe } from './ICustomPipe';
import { TransformSource, Pipe } from './types';
import { ITaskContext } from './ITaskContext';
import { IAssertDist } from './IAssertDist';
import { Gulp } from 'gulp';
import { IOutputPipe } from './IOutputPipe';

/**
 * pipe works.
 *
 * @export
 * @interface IPipeOption
 * @extends {ICustomPipe}
 */
export interface IPipeOption extends ICustomPipe {
    /**
     * task source stream config.
     *
     * @memberof IPipeOption
     */
    source?: TransformSource | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => TransformSource)
    /**
     * task pipe works.
     *
     * @memberof IDynamicTaskOption
     */
    pipes?: Pipe[] | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => Pipe[]);

    /**
     * output pipe task
     *
     * @memberof IPipeOption
     */
    output?: IOutputPipe[] | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => IOutputPipe[]);
}

