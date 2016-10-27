/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { Src, Operation, TaskSequence, ITaskConfig, Task } from './TaskConfig';
export declare function toSequence(tasks: TaskSequence, oper: Operation): Src[];
export declare function runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
export declare function runTaskSequence(gulp: Gulp, tasks: Task[], config: ITaskConfig): Promise<any>;
