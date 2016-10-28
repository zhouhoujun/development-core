/// <reference types="chai" />
import 'reflect-metadata';
import { ITask, ITaskInfo, ITaskDefine, Src } from './TaskConfig';
export declare function task(option?: ITaskInfo): (target: any) => any;
export declare function findTasks(target: any): ITask[];
export declare function taskdefine(): (target: any) => any;
export declare function findTaskDefines(target: any): ITaskDefine[];
export declare function findTaskDefine(target: any): ITaskDefine;
export declare function findTaskDefineInModule(md: string | Object): Promise<ITaskDefine>;
export declare function findTasksInModule(md: string | Object): Promise<ITask[]>;
export declare function findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
export declare function findTasksInDir(dirs: Src): Promise<ITask[]>;
