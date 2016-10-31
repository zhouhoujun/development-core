/// <reference types="chai" />
import 'reflect-metadata';
import { ITask, ITaskInfo, ITaskDefine, Src } from './TaskConfig';
export declare function task<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any;
export declare function dynamicTask<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any;
export declare function findTasks(target: any, match?: ITaskInfo): ITask[];
export declare function taskdefine<T extends Function>(target?: (new <T>() => T)): any;
export declare function findTaskDefines(target: any): ITaskDefine[];
export declare function findTaskDefine(target: any): ITaskDefine;
export declare function findTaskDefineInModule(md: string | Object): Promise<ITaskDefine>;
export declare function findTasksInModule(md: string | Object, match?: ITaskInfo): Promise<ITask[]>;
export declare function findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
export declare function findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]>;
