import { TaskSource, TaskString, Operation, ITaskInfo, Src } from './TaskConfig';
/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export declare function files(directory: string, express?: ((fileName: string) => boolean)): string[];
export declare function taskSourceVal(src: TaskSource, oper?: Operation): string | string[];
export declare function taskStringVal(name: TaskString, oper?: Operation): string;
/**
 * convert old version Operation to new version Operation
 *
 * @export
 * @param {ITaskInfo} tinfo
 * @param {any} [def=Operation.default]
 * @returns
 */
export declare function convertOper(tinfo: ITaskInfo, def?: Operation): ITaskInfo;
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
 * @param {ITaskInfo} tinfo
 * @param {ITaskInfo} match
 * @returns
 */
export declare function matchTaskInfo(tinfo: ITaskInfo, match: ITaskInfo): any;
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
