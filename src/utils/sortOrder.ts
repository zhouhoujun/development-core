import * as _ from 'lodash';
import { IMap } from './IMap';
import { Order } from '../types';
import { RunWay } from '../RunWay';
import { ITaskContext } from '../ITaskContext';

/**
 * sorting via order.
 *
 * @export
 * @template T
 * @param {T[]} sequence
 * @param {(item: T) => Order} orderBy
 * @param {ITaskContext} ctx
 * @param {boolean} [forceSequence=false]
 * @returns {(Array<T | T[]>)}
 */
export function sortOrder<T>(sequence: T[], orderBy: (item: T) => Order, ctx: ITaskContext, forceSequence = false): Array<T | T[]> {
    let parall: IMap<T[]> = {};
    sequence = _.filter(sequence, t => !!t);
    let rseq: Array<T | T[]> = _.orderBy(sequence, (t: T) => {
        if (_.isArray(t)) {
            return 0.5;
        } else {
            let order = orderBy(t);
            if (_.isFunction(order)) {
                order = order(sequence.length, ctx);
            }

            let orderVal: number;
            if (_.isNumber(order)) {
                orderVal = order;
            } else if (order) {
                order.value = _.isNumber(order.value) ? order.value : 0.5;
                if (!forceSequence && order.runWay === RunWay.parallel) {
                    parall[order.value] = parall[order.value] || [];
                    parall[order.value].push(t);
                }
                orderVal = order.value;
            } else {
                orderVal = 0.5;
            }

            if (orderVal > 1) {
                return (orderVal % sequence.length) / sequence.length;
            } else if (orderVal < 0) {
                orderVal = 0;
            }

            return orderVal;
        }
    });
    if (!forceSequence) {
        _.each(_.values(parall), pals => {
            let first = _.first(pals);
            rseq.splice(rseq.indexOf(first), pals.length, pals);
        });
    }

    return rseq;
}
