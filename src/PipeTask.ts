import { Gulp } from 'gulp';
import { TransformSource, IAssertDist, ITaskInfo, TaskResult, ITaskContext, IOperate, ICustomPipe, Pipe, OutputPipe, ITask, ITransform, IPipeOption } from './TaskConfig';
import { taskStringVal, sortOrder } from './utils';
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
 * mutil source stream pipe task run way.
 * 
 * @export
 * @enum {number}
 */
export enum RunWay {
    /**
     * run mutil source stream by sequence.
     */
    sequence = 1,
    /**
     * run mutil source stream by parallel.
     */
    parallel = 2
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
        // let source: TransformSource | Promise<TransformSource> = null;
        // ctx.pipeOption((op) => {
        //     if (!source && op.source) {
        //         source = _.isFunction(op.source) ? op.source(ctx, dist, gulp) : op.source;
        //     }
        // });

        // if (source) {
        //     return source;
        // }
        // return gulp.src(ctx.getSrc(this.getInfo()));

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
        // let pipes: Pipe[] = [];
        // ctx.pipeOption((op) => {
        //     let opps = _.isFunction(op.pipes) ? op.pipes(ctx, dist, gulp) : _.filter(<Pipe[]>op.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        //     if (opps && opps.length > 0) {
        //         pipes = pipes.concat(opps)
        //     }
        // });
        // return pipes;

        let option = ctx.option;
        let pipes: Pipe[] = null;
        let loader = <IPipeOption>option['loader'];
        if (loader && _.isFunction(loader.pipes)) {
            pipes = _.isFunction(loader.pipes) ? loader.pipes(ctx, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        }

        if (option.pipes) {
            let opps = _.isFunction(option.pipes) ? option.pipes(ctx, option, gulp) : _.filter(<Pipe[]>option.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
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
        // let pipes: OutputPipe[] = [];
        // ctx.pipeOption((op) => {
        //     if (pipes === null) {
        //         return;
        //     }
        //     if (op.output === null) {
        //         pipes = null;
        //     } else {
        //         let outs = _.isFunction(op.output) ? op.output(ctx, dist, gulp) : _.filter(<OutputPipe[]>op.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        //         if (outs && outs.length > 0) {
        //             pipes = pipes.concat(outs);
        //         }
        //     }
        // });

        // if (pipes === null) {
        //     return [(stream) => stream];
        // }

        // if (pipes.length > 0) {
        //     return pipes;
        // }

        // return [(stream) => stream.pipe(gulp.dest(ctx.getDist(dist)))]


        let option = ctx.option;
        let pipes: OutputPipe[] = null;
        let loader = <IPipeOption>option['loader'];
        if (loader && !_.isString(loader) && !_.isArray(loader)) {
            if (loader.output) {
                pipes = _.isFunction(loader.output) ? loader.output(ctx, option, gulp) : _.filter(<OutputPipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            } else if (loader.output === null) {
                return [(stream) => stream];
            }
        }
        if (option.output) {
            let opps = _.isFunction(option.output) ? option.output(ctx, option, gulp) : _.filter(<OutputPipe[]>option.output, p => _.isFunction(p) || (p.name && p.name === dist.name));
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
    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        // let prsrc: Promise<ITransform> = null;
        // ctx.pipeOption((op) => {
        //     if (op.pipe) {
        //         prsrc = prsrc ? prsrc.then(stream => this.cpipe2Promise(stream, op, ctx, dist, gulp))
        //             : this.cpipe2Promise(source, op, ctx, dist, gulp);
        //     }
        // }, false);

        // return prsrc || source;

        let cfgopt = ctx.option;
        let loader = <IPipeOption>cfgopt['loader'];
        let prsrc: Promise<ITransform>;
        if (cfgopt.pipe) {
            prsrc = this.cpipe2Promise(source, cfgopt, ctx, dist, gulp);
        }
        if (loader && !_.isString(loader) && !_.isArray(loader) && loader.pipe) {
            prsrc = prsrc ?
                prsrc.then(stream => this.cpipe2Promise(stream, loader, ctx, dist, gulp))
                : this.cpipe2Promise(source, loader, ctx, dist, gulp);
        }

        return prsrc || source;
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
     * @param {IPipeOperate} p
     * @param {string} name
     * @param {ITaskContext} context
     * @returns
     * 
     * @memberOf PipeTask
     */
    protected match(p: IOperate, name: string, context: ITaskContext) {
        if (!p) {
            return false;
        }
        if (p.name && !name.endsWith(taskStringVal(p.name, context))) {
            return false;
        }

        if (p.oper && (p.oper & context.oper) <= 0) {
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
        let name = ctx.subTaskName(dist, this.name);
        return Promise.all(_.map(pipes || this.pipes(ctx, dist, gulp), (p: Pipe) => {
            if (_.isFunction(p)) {
                return p(ctx, dist, gulp);
            } else {
                if (!this.match(p, name, ctx)) {
                    return null;
                } else {
                    return Promise.resolve(p.toTransform(ctx, dist, gulp))
                        .then(trs => {
                            trs.order = p.order;
                            return trs;
                        });
                }
            }
        }))
            .then(tanseq => {

                let tans = sortOrder<ITransform>(tanseq, it => it.order);

                _.each(tans, stream => {
                    if (!this.match(stream, name, ctx)) {
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
        let name = context.subTaskName(dist, this.name);
        let outputs = output || this.output(context, dist, gulp);
        return Promise.all(_.map(outputs, output => {
            if (_.isFunction(output)) {
                return output(source, context, dist, gulp);
            } else {
                if (!this.match(output, name, context)) {
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
        let tk = context.subTaskName(this.getInfo());
        console.log(`register ${this.name || ''} task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return this.execute(context, gulp);
        });

        this.info.taskName = tk;

        return tk;
    }
}
