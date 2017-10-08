import { RunWay } from './RunWay';
export interface IOrder {
    /**
     * the value to sort sequence.
     *
     * @type {number}
     * @memberof IOrder
     */
    value?: number;
    /**
     * before the task to run.
     *
     * @type {string}
     * @memberof IOrder
     */
    before?: string;
    /**
     * afater the task to run.
     *
     * @type {string}
     * @memberof IOrder
     */
    after?: string;
    /**
     * run Way type.
     *
     * @type {RunWay}
     * @memberof IOrder
     */
    runWay?: RunWay;
}
