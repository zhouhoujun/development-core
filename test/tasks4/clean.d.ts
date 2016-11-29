/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext } from '../../src';
export declare class Clean implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
