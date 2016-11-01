import { TaskSource, TaskString, Operation, ITaskInfo } from './TaskConfig';
export declare function files(directory: string, express?: ((fileName: string) => boolean)): string[];
export declare function taskSourceVal(src: TaskSource, oper?: Operation): string | string[];
export declare function taskStringVal(name: TaskString, oper?: Operation): string;
export declare function matchTaskGroup(tk: ITaskInfo, match: ITaskInfo): boolean;
