import { ITaskDecorator } from '../ITaskDecorator';
import { Operation } from '../Operation';
/**
 * has some oper samed.
 *
 * @export
 * @param {Operation} oper1
 * @param {Operation} oper2
 * @returns
 */
export declare function someOper(oper1: Operation, oper2: Operation): boolean;
/**
 * convert old version Operation to new version Operation
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {any} [def=Operation.default]
 * @returns
 */
export declare function convertOper(decor: ITaskDecorator, def?: Operation): ITaskDecorator;
