import { Order, TaskOperation, TaskString } from './types';

/**
 * operate.
 *
 * @export
 * @interface IOperate
 */
export interface IOperate {
    /**
     * operate name
     *
     * @type {TaskString}
     * @memberof IOperate
     */
    name?: TaskString;
    /**
     * operation
     *
     * enmu flags.
     * @type {TaskOperation}
     * @memberof IOperate
     */
    oper?: TaskOperation;
    /**
     * order index.
     *
     * @type {Order}
     * @memberof IOperate
     */
    order?: Order;

    /**
     * none pipe addation.
     *
     * @type {boolean}
     * @memberof IOperate
     */
    nonePipe?: boolean;

    /**
     * none output.
     *
     * @type {boolean}
     * @memberof IOperate
     */
    noneOutput?: boolean;
}
