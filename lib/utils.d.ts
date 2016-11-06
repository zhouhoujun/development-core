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
export declare function matchOper(tinfo: ITaskInfo, match: ITaskInfo): boolean;
export declare function matchTaskGroup(tinfo: ITaskInfo, match: ITaskInfo): boolean;
