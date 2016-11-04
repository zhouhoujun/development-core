/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { IAssertDist, ITaskInfo, TaskResult, ITaskConfig, Pipe, OutputPipe, ITask, ITransform } from './TaskConfig';
export interface IPipeTask extends ITask {
    name: string;
    sourceStream(config: ITaskConfig, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[];
    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
}
export declare abstract class PipeTask implements IPipeTask {
    name: string;
    decorator: ITaskInfo;
    constructor(info?: ITaskInfo);
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[];
    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
    protected getOption(config: ITaskConfig): IAssertDist;
    sourceStream(config: ITaskConfig, option: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
