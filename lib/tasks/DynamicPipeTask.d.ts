/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { PipeTask } from '../PipeTask';
import { ITaskInfo } from '../ITask';
import { Pipe, OutputPipe } from '../types';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';
import { IAssertDist } from '../IAssertDist';
import { ITransform } from '../ITransform';
/**
 * pipe task for dynamic task.
 *
 * @class DynamicPipeTask
 * @extends {PipeTask}
 */
export declare class DynamicPipeTask extends PipeTask {
    private dt;
    constructor(dt: IDynamicTaskOption, info?: ITaskInfo);
    protected getOption(ctx: ITaskContext): IAssertDist;
    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    pipes(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[];
    output(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
}
