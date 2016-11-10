/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { TransformSource, IAssertDist, ITaskInfo, TaskResult, ITaskConfig, IPipeOperate, ICustomPipe, Pipe, OutputPipe, ITask, ITransform } from './TaskConfig';
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
     * execute task works.
     *
     * @param {ITaskConfig} config
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf IPipeTask
     */
    execute(config: ITaskConfig, gulp: Gulp): Promise<any>;
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
    /**
     * convert custom pipe result to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ICustomPipe} opt
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns
     *
     * @memberOf PipeTask
     */
    protected cpipe2Promise(source: ITransform, opt: ICustomPipe, config: ITaskConfig, dist: IAssertDist, gulp: Gulp): Promise<ITransform>;
    /**
     * covert pipes transform to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {Pipe[]} [pipes]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected pipes2Promise(source: ITransform, config: ITaskConfig, dist: IAssertDist, gulp: Gulp, pipes?: Pipe[]): Promise<ITransform>;
    /**
     * output pipes transform to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {OutputPipe[]} [output]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected output2Promise(source: ITransform, config: ITaskConfig, dist: IAssertDist, gulp: Gulp, output?: OutputPipe[]): Promise<{}[]>;
    /**
     *  custom pipe Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns
     *
     * @memberOf PipeTask
     */
    protected customPipe(source: ITransform, config: ITaskConfig, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    /**
     * each one source stream works.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskConfig} config
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @param {Pipe[]} [pipes]
     * @param {OutputPipe[]} [output]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected working(source: ITransform, config: ITaskConfig, option: IAssertDist, gulp: Gulp, pipes?: Pipe[], output?: OutputPipe[]): Promise<void | {}[]>;
    /**
     * execute task working
     *
     * @param {ITaskConfig} config
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf PipeTask
     */
    execute(config: ITaskConfig, gulp: Gulp): Promise<any>;
    /**
     * setup task works.
     *
     * @param {ITaskConfig} config
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     *
     * @memberOf PipeTask
     */
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
