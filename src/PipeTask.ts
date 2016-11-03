import { Gulp } from 'gulp';
import { IAssertDist, ITaskInfo, TaskResult, ITaskConfig, Pipe, IOutputPipe, ITask, ITransform, ILoaderOption } from './TaskConfig';
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
    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): IOutputPipe[]
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
            return _.isFunction(loader.pipes) ? loader.pipes(config, option, gulp) : _.filter(<Pipe[]>loader.pipes, p => _.isFunction(p) || !p.name || (p.name && p.name === dist.name));
        } else {
            return [];
        }
    }

    output(config: ITaskConfig, dist: IAssertDist, gulp?: Gulp): IOutputPipe[] {
        let option = config.option;
        let loader = <ILoaderOption>option.loader;
        if (loader && !_.isString(loader) && !_.isArray(loader)) {
            if (loader.output) {
                return _.isFunction(loader.output) ? loader.output(config, option, gulp) : loader.output;
            } else if (loader.output === null) {
                return [(stream) => stream];
            }
        }

        return [(stream) => stream.pipe(gulp.dest(config.getDist(dist)))]
    }

    protected getOption(config: ITaskConfig): IAssertDist {
        return config.option;
    }

    sourceStream(config: ITaskConfig, option: IAssertDist, gulp: Gulp): ITransform | Promise<ITransform> {
        return gulp.src(config.getSrc(option, this.decorator));
    }

    setup(config: ITaskConfig, gulp?: Gulp): TaskResult {
        gulp = gulp || coregulp;
        let option = this.getOption(config);
        let tk = config.subTaskName(option, this.name);

        console.log(`register ${this.name} task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return Promise.resolve(this.sourceStream(config, option, gulp))
                .then(psrc => {
                    return Promise.all(_.map(this.pipes(config, option, gulp), (p: Pipe) => {
                        return _.isFunction(p) ? p(config, option, gulp) : p.toTransform(config, option, gulp);
                    }))
                        .then(tans => {
                            let len = tans.length;
                            tans = _.orderBy(tans, t => {
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
                                psrc = psrc.pipe(stream);
                            });
                            return psrc;
                        })
                })
                .then(stream => {
                    let outputs = this.output(config, option, gulp);
                    return Promise.all(_.map(outputs, output => {
                        return Promise.resolve<NodeJS.ReadWriteStream>((_.isFunction(output) ? output(stream, config, option, gulp) : output))
                            .then(output => {
                                return new Promise((resolve, reject) => {
                                    output
                                        .once('end', () => {
                                            resolve(output);
                                        })
                                        .once('error', reject);
                                });
                            });
                    }));
                })
                .catch(err => {
                    console.log(chalk.red(err));
                    process.exit(0);
                });
        });

        this.decorator.taskName = tk;

        return tk;
    }
}
