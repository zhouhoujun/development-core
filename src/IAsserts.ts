import { TaskString, TaskSource, TaskOperation, Order } from './types';
import { IAssertDist } from './IAssertDist';
import { IPipeOption } from './IPipeOption';
import { ICustomPipe } from './ICustomPipe';
import { NodeSequence } from './NodeSequence';
import { RunWay } from './RunWay';
import { ITaskInfo } from './ITask';

/**
 * IAsserts to be dealt with.
 *
 * @export
 * @interface IAsserts
 * @extends {IAssertDist}
 */
export interface IAsserts extends IAssertDist, IPipeOption, ICustomPipe {

    /**
     * asser operation.
     *
     * @type {TaskOperation}
     * @memberof IAsserts
     */
    oper?: TaskOperation;

    /**
     * current assert order.
     */
    order?: Order;

    /**
     * curr node run sequence with children context. default before children run.
     *
     * @type {NodeSequence}@memberof IAsserts
     */
    nodeSequence?: NodeSequence;

    /**
     * set default task name. if current context task has no name.
     *
     * @type {TaskString}
     * @memberof IAsserts
     */
    defaultTaskName?: TaskString;

    /**
     * task runway  in this context.  default sequence.
     *
     * @type {RunWay}@memberof IAsserts
     */
    runWay?: RunWay;
    /**
     * custom control how to match tasks.
     *
     * @param {ITaskInfo} task
     * @param {ITaskInfo} match
     * @returns {boolean}
     *
     * @memberof IAsserts
     */
    match?(task: ITaskInfo, match: ITaskInfo): boolean;
}
