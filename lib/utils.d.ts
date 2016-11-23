import { TaskSource, TaskString, Operation, Order, ITaskDecorator, ITaskInfo, Src, ITaskContext } from './TaskConfig';
/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export declare function files(directory: string, express?: ((fileName: string) => boolean)): string[];
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
 * task src, string or array string.
 *
 * @export
 * @param {TaskSource} src
 * @param {Operation} oper runtime Operation
 * @param {IEnvOption} [env]
 * @returns
 */
export declare function taskSourceVal(src: TaskSource, ctx: ITaskContext): string | string[];
/**
 * task string.
 *
 * @export
 * @param {TaskString} name
 * @param {ITaskContext} ctx
 * @returns
 */
export declare function taskStringVal(name: TaskString, ctx: ITaskContext): string;
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
 * match task via task info.
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {ITaskDecorator} match
 * @returns
 */
export declare function matchTaskInfo(decor: ITaskDecorator, match: ITaskDecorator): any;
export declare function matchTaskGroup(tinfo: ITaskInfo, match: ITaskInfo): boolean;
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
