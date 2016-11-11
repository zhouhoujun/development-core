import { Gulp } from 'gulp';
import { TransformSource, IAssertDist, ITaskInfo, TaskResult, ITaskContext, IOperate, ICustomPipe, Pipe, OutputPipe, ITask, ITransform, ILoaderOption } from './TaskConfig';
import { taskStringVal } from './utils';
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
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns {(TransformSource | Promise<TransformSource>)}
     * 
     * @memberOf IPipeTask
     */
    source(config: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource>;
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
    pipes(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[];

    /**
     * output pipes.
     * 
     * @param {ITaskConfig} [config]
     * @param {Gulp} [gulp]
     * @returns {OutputPipe[]}
     * 
     * @memberOf IPipeTask
     */
    output(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[];
    /**
     * execute task works.
     * 
     * @param {ITaskConfig} config
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     * 
     * @memberOf IPipeTask
     */
    execute(config: ITaskContext, gulp: Gulp): Promise<any>;
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
    /**
     * task info.
     * 
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    public decorator: ITaskInfo;
    constructor(info?: ITaskInfo) {
        this.decorator = info || {};
    }

    /**
     * source streams.
     * 
     * @param {ITaskConfig} config
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @returns {(TransformSource | Promise<TransformSource>)}
     * 
     * @memberOf PipeTask
     */
    source(config: ITaskContext, dist: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource> {
        let option = config.option;
        let pipes: Pipe[] = null;
        if (option.source) {
            return _.isFunction(option.source) ? option.source(config, dist, gulp) : option.source;
        }
        let loader = <ILoaderOption>option.loader;
        if (loader && _.isFunction(loader.pipes)) {
            pipes = _.isFunction(loader.pipes) ? loader.pipes(config, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        }
        return gulp.src(config.getSrc(dist, this.decorator));
    }

    /**
     * pelease use source method.
     * 
     * @param {ITaskConfig} config
     * @param {IAssertDist} option
     * @param {Gulp} gulp
     * @returns {(TransformSource | Promise<TransformSource>)}
     * 
     * @memberOf PipeTask
     */
    sourceStream(config: ITaskContext, option: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource> {
        return this.source(config, option, gulp);
    }

    /**
     * task pipe works.
     * 
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {Pipe[]}
     * 
     * @memberOf PipeTask
     */
    pipes(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        let option = config.option;
        let pipes: Pipe[] = null;
        let loader = <ILoaderOption>option.loader;
        if (loader && _.isFunction(loader.pipes)) {
            pipes = _.isFunction(loader.pipes) ? loader.pipes(config, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        }

        if (option.pipes) {
            let opps = _.isFunction(option.pipes) ? option.pipes(config, option, gulp) : _.filter(<Pipe[]>option.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            if (opps && opps.length > 0) {
                pipes = pipes ? pipes.concat(opps) : opps;
            }
        }
        return pipes || [];
    }

    /**
     * output pipes.
     * 
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} [gulp]
     * @returns {OutputPipe[]}
     * 
     * @memberOf PipeTask
     */
    output(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[] {
        let option = config.option;
        let pipes: OutputPipe[] = null;
        let loader = <ILoaderOption>option.loader;
        if (loader && !_.isString(loader) && !_.isArray(loader)) {
            if (loader.output) {
                pipes = _.isFunction(loader.output) ? loader.output(config, option, gulp) : _.filter(<OutputPipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            } else if (loader.output === null) {
                return [(stream) => stream];
            }
        }
        if (option.output) {
            let opps = _.isFunction(option.output) ? option.output(config, option, gulp) : _.filter(<OutputPipe[]>option.output, p => _.isFunction(p) || (p.name && p.name === dist.name));
            if (opps && opps.length > 0) {
                pipes = pipes ? pipes.concat(opps) : opps;
            }
        } else if (option.output === null) {
            return [(stream) => stream];
        }

        return pipes || [(stream) => stream.pipe(gulp.dest(config.getDist(dist)))]
    }

    /**
     * get option.
     * 
     * @protected
     * @param {ITaskConfig} config
     * @returns {IAssertDist}
     * 
     * @memberOf PipeTask
     */
    protected getOption(config: ITaskContext): IAssertDist {
        return config.option;
    }

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
    protected match(p: IOperate, name: string, config: ITaskContext) {
        if (!p) {
            return false;
        }
        if (p.name && !name.endsWith(taskStringVal(p.name, p.oper))) {
            return false;
        }

        if (p.oper && (p.oper & config.oper) <= 0) {
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
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @returns
     * 
     * @memberOf PipeTask
     */
    protected cpipe2Promise(source: ITransform, opt: ICustomPipe, config: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        return new Promise<ITransform>((resolve, reject) => {
            let ps = opt.pipe(source, config, dist, gulp, (err) => {
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
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {Pipe[]} [pipes]
     * @returns
     * 
     * @memberOf PipeTask
     */
    protected pipes2Promise(source: ITransform, config: ITaskContext, dist: IAssertDist, gulp: Gulp, pipes?: Pipe[]) {
        let name = config.subTaskName(dist, this.name);
        return Promise.all(_.map(pipes || this.pipes(config, dist, gulp), (p: Pipe) => {
            if (_.isFunction(p)) {
                return p(config, dist, gulp);
            } else {
                if (!this.match(p, name, config)) {
                    return null;
                } else {
                    return Promise.resolve(p.toTransform(config, dist, gulp))
                        .then(trs => {
                            trs.order = p.order;
                            // trs.oper = p.order;
                            return trs;
                        });
                }
            }
        }))
            .then(tans => {
                let len = tans.length;
                tans = _.orderBy(_.filter(tans, t => t), t => {
                    if (_.isArray(t)) {
                        return len;
                    } else {
                        if (_.isNumber(t.order)) {
                            return t.order;
                        }
                        return len;
                    }
                });

                _.each(tans, stream => {
                    if (!this.match(stream, name, config)) {
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
     * @param {ITaskConfig} config
     * @param {IAssertDist} dist
     * @param {Gulp} gulp
     * @param {OutputPipe[]} [output]
     * @returns
     * 
     * @memberOf PipeTask
     */
    protected output2Promise(source: ITransform, config: ITaskContext, dist: IAssertDist, gulp: Gulp, output?: OutputPipe[]) {
        let name = config.subTaskName(dist, this.name);
        let outputs = output || this.output(config, dist, gulp);
        return Promise.all(_.map(outputs, output => {
            if (_.isFunction(output)) {
                return output(source, config, dist, gulp);
            } else {
                if (!this.match(output, name, config)) {
                    return null;
                } else {
                    return output.toTransform(source, config, dist, gulp);
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
    protected customPipe(source: ITransform, config: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        let cfgopt = config.option;
        let loader = <ILoaderOption>cfgopt.loader;
        let prsrc: Promise<ITransform>;
        if (cfgopt.pipe) {
            prsrc = this.cpipe2Promise(source, cfgopt, config, dist, gulp);
        }
        if (loader && !_.isString(loader) && !_.isArray(loader) && loader.pipe) {
            prsrc = prsrc ?
                prsrc.then(stream => this.cpipe2Promise(stream, loader, config, dist, gulp))
                : this.cpipe2Promise(source, loader, config, dist, gulp);
        }

        return prsrc || source;
    }

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
    protected working(source: ITransform, config: ITaskContext, option: IAssertDist, gulp: Gulp, pipes?: Pipe[], output?: OutputPipe[]) {
        return Promise.resolve(source)
            .then(psrc => this.customPipe(psrc, config, option, gulp))
            .then(psrc => this.pipes2Promise(psrc, config, option, gulp, pipes))
            .then(psrc => this.output2Promise(psrc, config, option, gulp, output))
            .catch(err => {
                console.log(chalk.red(err));
                process.exit(0);
            });
    }

    /**
     * execute task working
     * 
     * @param {ITaskConfig} config
     * @param {Gulp} gulp
     * @returns {Promise<any>}
     * 
     * @memberOf PipeTask
     */
    execute(config: ITaskContext, gulp: Gulp): Promise<any> {
        let option = this.getOption(config);
        return Promise.resolve(this.sourceStream(config, option, gulp))
            .then(stream => {
                if (_.isArray(stream)) {
                    if (this.runWay === RunWay.parallel) {
                        return Promise.all(_.map(stream, st => this.working(st, config, option, gulp)));
                    } else if (this.runWay === RunWay.sequence) {
                        let pthen: Promise<any>;
                        _.each(stream, st => {
                            if (!pthen) {
                                pthen = this.working(st, config, option, gulp);
                            } else {
                                pthen = pthen.then(() => {
                                    return this.working(st, config, option, gulp);
                                });
                            }
                        });
                        return pthen;
                    } else {
                        return Promise.reject('runWay setting error.');
                    }
                } else {
                    return this.working(stream, config, option, gulp);
                }
            });
    }

    /**
     * setup task works.
     * 
     * @param {ITaskConfig} config
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     * 
     * @memberOf PipeTask
     */
    setup(config: ITaskContext, gulp?: Gulp): TaskResult {
        gulp = gulp || coregulp;
        let option = this.getOption(config);
        let tk = config.subTaskName(option, this.name);
        console.log(`register ${this.name || ''} task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return this.execute(config, gulp);
        });

        this.decorator.taskName = tk;

        return tk;
    }
}
