import { Operation, Order, ITaskDecorator, Src, ITaskContext } from './TaskConfig';
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
/**
 * convert old version Operation to new version Operation
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {any} [def=Operation.default]
 * @returns
 */
export declare function convertOper(decor: ITaskDecorator, def?: Operation): ITaskDecorator;
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
 * match
 *
 * @export
 * @param {ITaskDecorator} tinfo
 * @param {ITaskDecorator} match
 * @param {ITaskContext} [ctx]
 * @returns
 */
export declare function matchCompare(tinfo: ITaskDecorator, match: ITaskDecorator, ctx?: ITaskContext): boolean;
/**
 * convert path to absolute path.
 *
 * @export
 * @param {string} root
 * @param {string} pathstr
 * @returns {string}
 */
export declare function absolutePath(root: string, pathstr: string): string;
/**
 * convert src to absolute path src.
 *
 * @export
 * @param {string} root
 * @param {Src} src
 * @returns {Src}
 */
export declare function absoluteSrc(root: string, src: Src): Src;
