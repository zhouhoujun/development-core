/// <reference types="chai" />
import 'reflect-metadata';
import { ITask, ITaskInfo, ITaskDefine, Src, Operation, IEnvOption } from './TaskConfig';
export declare function task<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any;
export declare function dynamicTask<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any;
export declare function findTasks(target: any, oper?: Operation, env?: IEnvOption): ITask[];
export declare function taskdefine<T extends Function>(target?: (new <T>() => T)): any;
export declare function findTaskDefines(target: any): ITaskDefine[];
export declare function findTaskDefine(target: any): ITaskDefine;
export declare function findTaskDefineInModule(md: string | Object): Promise<ITaskDefine>;
export declare function findTasksInModule(md: string | Object, oper?: Operation, env?: IEnvOption): Promise<ITask[]>;
export declare function findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
export declare function findTasksInDir(dirs: Src, oper?: Operation, env?: IEnvOption): Promise<ITask[]>;
