import 'reflect-metadata';
import { ITask, ITaskInfo, ITaskDefine } from './TaskConfig';
export declare function task(option?: ITaskInfo): (target: any) => any;
export declare function findTasks(target: any): ITask[];
export declare function taskdefine(): (target: any) => any;
export declare function findTaskDefine(target: any): ITaskDefine[];
