import { Gulp } from 'gulp';
import { TransformSource, IAssertDist, ITaskInfo, TaskResult, ITaskConfig, IPipeOperate, Pipe, OutputPipe, ITask, ITransform, ILoaderOption } from './TaskConfig';
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

    pipes(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        let option = config.option;
        let loader = <ILoaderOption>option.loader;
        if (loader && _.isFunction(loader.pipes)) {
            return _.isFunction(loader.pipes) ? loader.pipes(config, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
        } else {
            return [];
        }
    }

    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): OutputPipe[] {
        let option = config.option;
        let loader = <ILoaderOption>option.loader;
        if (loader && !_.isString(loader) && !_.isArray(loader)) {
            if (loader.output) {
                return _.isFunction(loader.output) ? loader.output(config, option, gulp) : _.filter(<OutputPipe[]>loader.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            } else if (loader.output === null) {
                return [(stream) => stream];
            }
        }

        return [(stream) => stream.pipe(gulp.dest(config.getDist(dist)))]
    }

    protected getOption(config: ITaskConfig): IAssertDist {
        return config.option;
    }

    sourceStream(config: ITaskConfig, option: IAssertDist, gulp: Gulp): TransformSource | Promise<TransformSource> {
        return gulp.src(config.getSrc(option, this.decorator));
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
    protected match(p: IPipeOperate, name: string, config: ITaskConfig) {
        if (!p) {
            return false;
        }
        if (p.name && !name.endsWith(name)) {
            return false;
        }

        if (p.oper && (p.oper & config.oper) <= 0) {
            return false;
        }

        return true;
    }

    working(source: ITransform, config: ITaskConfig, option: IAssertDist, gulp: Gulp) {
        let name = config.subTaskName(option, this.name);
        return Promise.resolve(source)
            .then(psrc => {
                return Promise.all(_.map(this.pipes(config, option, gulp), (p: Pipe) => {
                    if (_.isFunction(p)) {
                        return p(config, option, gulp);
                    } else {
                        if (!this.match(p, name, config)) {
                            return null;
                        } else {
                            return Promise.resolve(p.toTransform(config, option, gulp))
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
                                psrc = stream.transformSourcePipe(psrc);
                            } else if (_.isFunction(psrc.transformPipe)) {
                                psrc = psrc.transformPipe(stream);
                            } else {
                                psrc = psrc.pipe(stream);
                            }
                        });
                        return psrc;
                    })
            })
            .then(stream => {
                let outputs = this.output(config, option, gulp);
                return Promise.all(_.map(outputs, output => {
                    if (_.isFunction(output)) {
                        return output(stream, config, option, gulp);
                    } else {
                        if (!this.match(output, name, config)) {
                            return null;
                        } else {
                            return output.toTransform(stream, config, option, gulp);
                        }
                    }
                }))
            }).then(outputs => {
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
            .catch(err => {
                console.log(chalk.red(err));
                process.exit(0);
            });
    }

    setup(config: ITaskConfig, gulp?: Gulp): TaskResult {
        gulp = gulp || coregulp;
        let option = this.getOption(config);
        let tk = config.subTaskName(option, this.name);

        console.log(`register ${this.name} task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
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
                })

        });

        this.decorator.taskName = tk;

        return tk;
    }
}
