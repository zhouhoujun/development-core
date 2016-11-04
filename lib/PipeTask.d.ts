/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { IAssertDist, ITaskInfo, TaskResult, ITaskConfig, Pipe, OutputPipe, ITask, ITransform } from './TaskConfig';
/**
 * pipe task.
 *
 * @export
 * @interface IPipeWork
 */
export interface IPipeTask extends ITask {
    /**
     * task default name.
     *
     * @type {string}
     * @memberOf IPipeTask
     */
    name: string;
    /**
     * gulp src stream.
     *
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns {(ITransform | Promise<ITransform>)}
     *
     * @memberOf IPipeTask
     */
    sourceStream(config: ITaskConfig, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    /**
     * task pipe works.
     *
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {Pipe[]}
     *
     * @memberOf IPipeTask
     */
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[];
    /**
     * output pipes.
     *
     * @param {ITaskConfig} [config]
     * @param {Gulp} [gulp]
     * @returns {OutputPipe[]}
     *
     * @memberOf IPipeTask
     */
    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
}
/**
 * Task base class.
 *
 * @export
 * @class Task
 * @implements {ITask}
 */
export declare abstract class PipeTask implements IPipeTask {
    /**
     * task default name.
     *
     * @type {string}
     * @memberOf PipeTask
     */
    name: string;
    /**
     * task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    decorator: ITaskInfo;
    constructor(info?: ITaskInfo);
    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[];
    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
    protected getOption(config: ITaskConfig): IAssertDist;
    sourceStream(config: ITaskConfig, option: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
