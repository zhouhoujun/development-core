import { TaskSource, TaskString, Operation, ITaskInfo } from './TaskConfig';
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
export declare function matchOper(tinfo: ITaskInfo, match: ITaskInfo): any;
export declare function matchTaskGroup(tinfo: ITaskInfo, match: ITaskInfo): boolean;
