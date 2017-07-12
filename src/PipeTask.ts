import { Gulp } from 'gulp';
import { TransformSource, RunWay, IAssertDist, ITaskInfo, TaskResult, ITaskContext, IOperate, ICustomPipe, Pipe, OutputPipe, ITask, ITransform, IPipeOption } from './TaskConfig';
import { sortOrder } from './utils';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';
import * as _ from 'lodash';

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
export abstract class PipeTask implements IPipeTask {
    /**
     * run mutil source stream way. default parallel.
     *
     * @memberOf PipeTask
     */
    public runWay = RunWay.parallel;
    /**
     * task default name.
     *
     * @type {string}
     * @memberOf PipeTask
     */
    name: string;


    constructor(info?: ITaskInfo) {
        this.info = info || {};
        this.info.name = this.info.name || this.name;
    }

    protected info: ITaskInfo;

    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    public getInfo(): ITaskInfo {
        if (!this.info.name) {
            this.info.name = this.name;
        }
        return this.info;
    }

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
    source(ctx: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource> {
        let option = ctx.option;
        if (option.source) {
            return _.isFunction(option.source) ? option.source(ctx, dist, gulp) : option.source;
        }
        let loader = <IPipeOption>option['loader'];
        if (loader && option.source) {
            return _.isFunction(loader.source) ? loader.source(ctx, dist, gulp) : loader.source;
        }
        return gulp.src(ctx.getSrc(this.getInfo()));
    }



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
    pipes(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        let option = ctx.option;
        let pipes: Pipe[] = null;
        let loader = <IPipeOption>option['loader'];
        if (loader && _.isFunction(loader.pipes)) {
            pipes = _.isFunction(loader.pipes) ? loader.pipes(ctx, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => p);
        }

        if (option.pipes) {
            let opps = _.isFunction(option.pipes) ? option.pipes(ctx, option, gulp) : _.filter(<Pipe[]>option.pipes, p => p);
            if (opps && opps.length > 0) {
                pipes = pipes ? pipes.concat(opps) : opps;
            }
        }
        return pipes || [];
    }

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
    output(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[] {
        let option = ctx.option;
        let pipes: OutputPipe[] = null;
        let loader = <IPipeOption>option['loader'];
        if (loader && !_.isString(loader) && !_.isArray(loader)) {
            if (loader.output) {
                pipes = _.isFunction(loader.output) ? loader.output(ctx, option, gulp) : _.filter(<OutputPipe[]>loader.pipes, p => p);
            } else if (loader.output === null) {
                return [(stream) => stream];
            }
        }
        if (option.output) {
            let opps = _.isFunction(option.output) ? option.output(ctx, option, gulp) : _.filter(<OutputPipe[]>option.output, p => p);
            if (opps && opps.length > 0) {
                pipes = pipes ? pipes.concat(opps) : opps;
            }
        } else if (option.output === null) {
            return [(stream) => stream];
        }

        return pipes || [(stream) => stream.pipe(gulp.dest(ctx.getDist(dist)))]
    }

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
    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform> {
        let cfgopt = ctx.option;
        let loader = <IPipeOption>cfgopt['loader'];
        let prsrc: Promise<ITransform>;
        let oper;
        if (cfgopt.pipe) {
            oper = this.getTransformOperate(source);
            prsrc = this.cpipe2Promise(source, cfgopt, ctx, dist, gulp);
        }
        if (loader && !_.isString(loader) && !_.isArray(loader) && loader.pipe) {
            oper = this.getTransformOperate(source);
            prsrc = prsrc ?
                prsrc.then(stream => {
                    this.setTransformOperate(stream, oper);
                    return this.cpipe2Promise(stream, loader, ctx, dist, gulp)
                })
                : this.cpipe2Promise(source, loader, ctx, dist, gulp);
        }

        if (prsrc) {
            return prsrc.then(stream => {
                this.setTransformOperate(stream, oper);
                return stream;
            });
        }

        return source;
    }

    /**
     * get option.
     *
     * @protected
     * @param {ITaskContext} context
     * @returns {IAssertDist}
     *
     * @memberOf PipeTask
     */
    protected getOption(context: ITaskContext): IAssertDist {
        return context.option;
    }

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
    protected match(p: IOperate, name: string, ctx: ITaskContext, trsOperate?: IOperate, isOutput = false) {
        // return this.matchOperate(p, name, ctx, isOutput) && (!trsOperate || (trsOperate && this.matchOperate(trsOperate, name, ctx, isOutput)));
        return this.matchOperate(p, name, ctx, isOutput) || (trsOperate && this.matchOperate(trsOperate, name, ctx, isOutput));
    }

    /**
     * match operate.
     * @param p
     * @param name
     * @param ctx
     * @param isOutput
     */
    protected matchOperate(p: IOperate, name: string, ctx: ITaskContext, isOutput = false) {
        if (!p) {
            return false;
        }
        if (p.name && !name.endsWith(ctx.toStr(p.name))) {
            return false;
        }

        if (p.oper && (ctx.to(p.oper) & ctx.oper) <= 0) {
            return false;
        }

        if (isOutput && p.noneOutput === true) {
            return false;
        } else if (!isOutput && p.nonePipe === true) {
            return false;
        }

        return true;
    }

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
    protected cpipe2Promise(source: ITransform, opt: ICustomPipe, context: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        return new Promise<ITransform>((resolve, reject) => {
            let ps = opt.pipe(source, context, dist, gulp, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            if (ps) {
                Promise.resolve(ps).then(resolve, reject);
            }
        });
    }


    protected operateFileds = ['name', 'oper', 'order', 'nonePipe', 'noneOutput'];
    /**
     * get transform Operate.
     *
     * @protected
     * @param {ITransform} source
     * @returns {IOperate}
     *
     * @memberOf PipeTask
     */
    protected getTransformOperate(source: ITransform): IOperate {
        return _.pick(source, this.operateFileds) as IOperate;
    }

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
    protected setTransformOperate(source: ITransform, operate: IOperate) {
        if (!source) {
            return;
        }

        _.each(this.operateFileds, n => {
            if (!_.isUndefined(operate[n])) {
                source[n] = operate[n];
            }
        });
    }

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
    protected pipes2Promise(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp, pipes?: Pipe[]) {
        let name = ctx.taskName(dist, this.name);
        let oper = this.getTransformOperate(source);
        if (!this.match(oper, name, ctx)) {
            return Promise.resolve(source);
        }
        return Promise.all(_.map(pipes || this.pipes(ctx, dist, gulp), (p: Pipe) => {
            if (_.isFunction(p)) {
                return p(ctx, dist, gulp);
            } else {
                if (!this.match(p, name, ctx)) {
                    return null;
                } else {
                    return Promise.resolve(p.toTransform(ctx, dist, gulp))
                        .then(trs => {
                            this.setTransformOperate(trs, p);
                            // trs.order = p.order;
                            return trs;
                        });
                }
            }
        }))
            .then(tanseq => {

                let tans = sortOrder<ITransform>(tanseq, it => it.order, ctx, true);

                _.each(tans, (stream: ITransform) => {
                    if (!this.match(stream, name, ctx, oper)) {
                        return;
                    }

                    if (_.isFunction(stream.transformSourcePipe)) {
                        source = stream.transformSourcePipe(source);
                    } else if (_.isFunction(source.transformPipe)) {
                        source = source.transformPipe(stream);
                    } else {
                        source = source.pipe(stream);
                    }
                });
                this.setTransformOperate(source, oper);
                return source;
            });
    }

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
    protected output2Promise(source: ITransform, context: ITaskContext, dist: IAssertDist, gulp: Gulp, output?: OutputPipe[]) {
        let name = context.taskName(dist, this.name);
        let oper = this.getTransformOperate(source);
        let outputs = output || this.output(context, dist, gulp);
        return Promise.all(_.map(outputs, output => {
            if (_.isFunction(output)) {
                return output(source, context, dist, gulp);
            } else {
                if (!this.match(output, name, context, oper, true)) {
                    return null;
                } else {
                    return output.toTransform(source, context, dist, gulp);
                }
            }
        }))
            .then(outputs => {
                return Promise.all(_.map(outputs, output => {
                    return new Promise((resolve, reject) => {
                        if (output) {
                            output
                                .once('end', () => {
                                    resolve(output);
                                })
                                .once('error', reject);
                        } else {
                            resolve();
                        }
                    }).then(result => {
                        output.removeAllListeners('error');
                        output.removeAllListeners('end');
                        return result;
                    });
                }));
            })
    }

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
    protected working(source: ITransform, ctx: ITaskContext, option: IAssertDist, gulp: Gulp, pipes?: Pipe[], output?: OutputPipe[]) {
        return Promise.resolve(source)
            .then(psrc => this.customPipe(psrc, ctx, option, gulp))
            .then(psrc => this.pipes2Promise(psrc, ctx, option, gulp, pipes))
            .then(psrc => this.output2Promise(psrc, ctx, option, gulp, output))
            .catch(err => {
                console.log(chalk.red(err));
                process.exit(0);
            });
    }

    /**
     * execute task working
     *
     * @param {ITaskContext} context
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     *
     * @memberOf PipeTask
     */
    execute(context: ITaskContext, gulp: Gulp): Promise<any> {
        let option = this.getOption(context);
        return Promise.resolve(this.source(context, option, gulp))
            .then(stream => {
                if (_.isArray(stream)) {
                    if (this.runWay === RunWay.parallel) {
                        return Promise.all(_.map(stream, st => this.working(st, context, option, gulp)));
                    } else if (this.runWay === RunWay.sequence) {
                        let pthen: Promise<any>;
                        _.each(stream, st => {
                            if (!pthen) {
                                pthen = this.working(st, context, option, gulp);
                            } else {
                                pthen = pthen.then(() => {
                                    return this.working(st, context, option, gulp);
                                });
                            }
                        });
                        return pthen;
                    } else {
                        return Promise.reject('runWay setting error.');
                    }
                } else {
                    return this.working(stream, context, option, gulp);
                }
            });
    }

    /**
     * setup task works.
     *
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     *
     * @memberOf PipeTask
     */
    setup(context: ITaskContext, gulp?: Gulp): TaskResult {
        gulp = gulp || coregulp;
        // let option = this.getOption(context);
        let tk = context.taskName(this.getInfo());
        console.log(`register ${this.name || ''} task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return this.execute(context, gulp);
        });

        this.info.taskName = tk;

        return tk;
    }
}
