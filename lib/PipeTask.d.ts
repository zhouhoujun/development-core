/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { TransformSource, IAssertDist, ITaskInfo, TaskResult, ITaskConfig, IPipeOperate, Pipe, OutputPipe, ITask, ITransform } from './TaskConfig';
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
     * @returns {(TransformSource | Promise<TransformSource>)}
     *
     * @memberOf IPipeTask
     */
    sourceStream(config: ITaskConfig, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>;
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
    /**
     * pipe task working.
     *
     * @param {ITransform} source
     * @param {ITaskConfig} config
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf IPipeTask
     */
    working(source: ITransform, config: ITaskConfig, option: IAssertDist, gulp: Gulp): Promise<any>;
}
/**
 * mutil source stream pipe task run way.
 *
 * @export
 * @enum {number}
 */
export declare enum RunWay {
    /**
     * run mutil source stream by sequence.
     */
    sequence = 1,
    /**
     * run mutil source stream by parallel.
     */
    parallel = 2,
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
     * run mutil source stream way. default parallel.
     *
     *
     * @memberOf PipeTask
     */
    runWay: RunWay;
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
    sourceStream(config: ITaskConfig, option: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>;
    /**
     * match pipe Operate
     *
     * @param {IPipeOperate} p
     * @param {string} name
     * @param {ITaskConfig} config
     * @returns
     *
     * @memberOf PipeTask
     */
    protected match(p: IPipeOperate, name: string, config: ITaskConfig): boolean;
    working(source: ITransform, config: ITaskConfig, option: IAssertDist, gulp: Gulp): Promise<void | {}[]>;
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
