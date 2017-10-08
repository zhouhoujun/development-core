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
export function someOper(oper1: Operation, oper2: Operation) {
    return (oper1 & oper2) > 0;
}

/**
 * convert old version Operation to new version Operation
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {any} [def=Operation.default]
 * @returns
 */
export function convertOper(decor: ITaskDecorator, def = Operation.default) {
    decor = decor || {};
    // // todo  compatibility
    // if (decor['watch']) {
    //     decor.oper = (decor.oper || def) | Operation.watch;
    // }
    // if (decor['e2e']) {
    //     decor.oper = (decor.oper || def) | Operation.e2e;
    // }
    // if (decor['test']) {
    //     decor.oper = (decor.oper || def) | Operation.test;
    // }
    // // ----

    decor.oper = decor.oper || def;
    return decor;
}
