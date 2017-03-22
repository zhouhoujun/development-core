/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { TransformSource, RunWay, IAssertDist, ITaskInfo, TaskResult, ITaskContext, IOperate, ICustomPipe, Pipe, OutputPipe, ITask, ITransform } from './TaskConfig';
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
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns {(TransformSource | Promise<TransformSource>)}
     *
     * @memberOf IPipeTask
     */
    source(context: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>;
    /**
     * task pipe works.
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {Pipe[]}
     *
     * @memberOf IPipeTask
     */
    pipes(context: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[];
    /**
     * output pipes.
     *
     * @param {ITaskContext} [context]
     * @param {Gulp} [gulp]
     * @returns {OutputPipe[]}
     *
     * @memberOf IPipeTask
     */
    output(context: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
    /**
     * execute task works.
     *
     * @param {ITaskContext} context
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf IPipeTask
     */
    execute(context: ITaskContext, gulp: Gulp): Promise<any>;
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
    constructor(info?: ITaskInfo);
    protected info: ITaskInfo;
    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    getInfo(): ITaskInfo;
    /**
     * source streams.
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @returns {(TransformSource | Promise<TransformSource>)}
     *
     * @memberOf PipeTask
     */
    source(ctx: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>;
    /**
     * task pipe works.
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {Pipe[]}
     *
     * @memberOf PipeTask
     */
    pipes(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[];
    /**
     * output pipes.
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {OutputPipe[]}
     *
     * @memberOf PipeTask
     */
    output(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
    /**
     *  custom pipe Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskContext} ctx
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns
     *
     * @memberOf PipeTask
     */
    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform>;
    /**
     * get option.
     *
     * @protected
     * @param {ITaskContext} context
     * @returns {IAssertDist}
     *
     * @memberOf PipeTask
     */
    protected getOption(context: ITaskContext): IAssertDist;
    /**
     * match pipe Operate
     *
     * @protected
     * @param {IOperate} p
     * @param {string} name
     * @param {ITaskContext} ctx
     * @param {IOperate} [trsOperate]
     * @param {boolean} [isOutput=false]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected match(p: IOperate, name: string, ctx: ITaskContext, trsOperate?: IOperate, isOutput?: boolean): boolean;
    /**
     * convert custom pipe result to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ICustomPipe} opt
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns
     *
     * @memberOf PipeTask
     */
    protected cpipe2Promise(source: ITransform, opt: ICustomPipe, context: ITaskContext, dist: IAssertDist, gulp: Gulp): Promise<ITransform>;
    protected operateFileds: string[];
    /**
     * get transform Operate.
     *
     * @protected
     * @param {ITransform} source
     * @returns {IOperate}
     *
     * @memberOf PipeTask
     */
    protected getTransformOperate(source: ITransform): IOperate;
    /**
     * set transform Operate.
     *
     * @protected
     * @param {ITransform} source
     * @param {IOperate} operate
     * @returns
     *
     * @memberOf PipeTask
     */
    protected setTransformOperate(source: ITransform, operate: IOperate): void;
    /**
     * covert pipes transform to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {Pipe[]} [pipes]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected pipes2Promise(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp, pipes?: Pipe[]): Promise<ITransform>;
    /**
     * output pipes transform to Promise.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskContext} context
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {OutputPipe[]} [output]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected output2Promise(source: ITransform, context: ITaskContext, dist: IAssertDist, gulp: Gulp, output?: OutputPipe[]): Promise<ITransform[]>;
    /**
     * each one source stream works.
     *
     * @protected
     * @param {ITransform} source
     * @param {ITaskContext} ctx
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @param {Pipe[]} [pipes]
     * @param {OutputPipe[]} [output]
     * @returns
     *
     * @memberOf PipeTask
     */
    protected working(source: ITransform, ctx: ITaskContext, option: IAssertDist, gulp: Gulp, pipes?: Pipe[], output?: OutputPipe[]): Promise<void | ITransform[]>;
    /**
     * execute task working
     *
     * @param {ITaskContext} context
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf PipeTask
     */
    execute(context: ITaskContext, gulp: Gulp): Promise<any>;
    /**
     * setup task works.
     *
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     *
     * @memberOf PipeTask
     */
    setup(context: ITaskContext, gulp?: Gulp): TaskResult;
}
