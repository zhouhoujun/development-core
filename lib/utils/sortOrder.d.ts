import { Order } from '../types';
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
export declare function sortOrder<T>(sequence: T[], orderBy: (item: T) => Order, ctx: ITaskContext, forceSequence?: boolean): Array<T | T[]>;
