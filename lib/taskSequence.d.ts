/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { Src, ITaskInfo, ITaskConfig, ITask } from './TaskConfig';
export declare function toSequence(gulp: Gulp, tasks: ITask[], config: ITaskConfig): Src[];
export declare function addToSequence(taskSequence: Src[], rst: ITaskInfo): (string | string[])[];
export declare function runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
export declare function runTaskSequence(gulp: Gulp, tasks: ITask[], config: ITaskConfig): Promise<any>;
