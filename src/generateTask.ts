import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';

import { ITaskInfo, TaskResult, Pipe, IDynamicTask, ITaskConfig, ITask } from './TaskConfig';
import { matchTaskGroup } from './utils';

type factory = (config: ITaskConfig, gulp: Gulp) => TaskResult;
class DynamicTask implements ITask {
    constructor(public decorator: ITaskInfo, private factory: factory) {
    }
    setup(config: ITaskConfig, gulp?: Gulp) {
        let name = this.factory(config, gulp || coregulp);
        if (name) {
            this.decorator.taskName = name;
        }
        return name;
    }
}

/**
 * dynamic build tasks.
 * 
 * @export
 * @param {(IDynamicTask | IDynamicTask[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export function generateTask(tasks: IDynamicTask | IDynamicTask[], match?: ITaskInfo): ITask[] {
    let taskseq: ITask[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {

        if (match && match.oper && dt.oper && (dt.oper & match.oper) <= 0) {
            return;
        }

        if (!matchTaskGroup(dt, match)) {
            return;
        }


        if (dt.watchTasks) {
            dt.watch = dt.watch || !!dt.watchTasks;
        }

        if (dt.watch) {
            if (!match || !match.watch) {
                return;
            }
            if (dt.watch === match.watch) {
                taskseq.push(createWatchTask(dt));
            }
        } else if (_.isFunction(dt.task)) {
            // custom task
            taskseq.push(createTask(dt));
        } else {
            // pipe stream task.
            taskseq.push(createPipesTask(dt));
        }
    });

    return taskseq;
}



/**
 * promise task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createTask(dt: IDynamicTask) {
    let factory = (cfg: ITaskConfig, gulp: Gulp) => {
        let tk = cfg.subTaskName(dt.name);
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            return dt.task(cfg, dt, gulp);
        });

        return tk
    };

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: dt.watch, group: dt.group }, factory);
}
/**
 * create dynamic watch task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createWatchTask(dt: IDynamicTask) {
    let factory = (cfg: ITaskConfig, gulp: Gulp) => {
        let watchs = _.isFunction(dt.watchTasks) ? dt.watchTasks(cfg) : dt.watchTasks;
        if (!_.isFunction(_.last(watchs))) {
            watchs.push(<WatchCallback>(event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, cfg);
            });
        }
        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return cfg.subTaskName(w);
            }
            return w;
        })
        let tk = cfg.subTaskName(dt);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            console.log('watch, src:', chalk.cyan.call(chalk, cfg.option.src));
            gulp.watch(cfg.getSrc(dt), watchs)
        });

        return tk;
    };

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: dt.watch, group: dt.group }, factory);
}
function createPipesTask(dt: IDynamicTask) {
    let factory = (cfg: ITaskConfig, gulp: Gulp) => {

        let tk = cfg.subTaskName(dt);
        console.log('register pipes  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let taskPromise = Promise.resolve(gulp.src(cfg.getSrc(dt)));
            if (dt.pipes) {
                let pipes = _.isFunction(dt.pipes) ? dt.pipes(cfg, dt, gulp) : dt.pipes;
                taskPromise = taskPromise.then(psrc => {
                    return Promise.all(_.map(pipes, (p: Pipe) => {
                        return _.isFunction(p) ? p(cfg, dt, gulp) : p;
                    }))
                        .then(streams => {
                            _.each(streams, stream => {
                                psrc = psrc.pipe(stream);
                            });
                            return psrc;
                        })
                });

            } else if (dt.pipe) {
                taskPromise = taskPromise.then((stream => {
                    return new Promise((resolve, reject) => {
                        return dt.pipe(stream, cfg, dt, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(stream);
                            }
                        });
                    });
                }));
            }

            if (dt.output !== null) {
                taskPromise = taskPromise.then(stream => {
                    if (dt.output) {
                        let outputs = _.isFunction(dt.output) ? dt.output(cfg, dt) : dt.output;
                        return Promise.all(_.map(outputs, output => {
                            return Promise.resolve<NodeJS.ReadWriteStream>((_.isFunction(output) ? output(stream, cfg, dt, gulp) : output))
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
                    } else {
                        return new Promise((resolve, reject) => {
                            let output = gulp.dest(cfg.getDist(dt));
                            stream.pipe(output)
                                .once('end', () => {
                                    resolve(output)
                                })
                                .once('error', reject);
                        });
                    }
                });
            } else {
                taskPromise = taskPromise.then(stream => {
                    return new Promise((resolve, reject) => {
                        stream
                            .once('end', () => {
                                resolve(stream);
                            })
                            .once('error', reject);
                    });
                });
            }

            // return taskPromise;
            return taskPromise.catch(err => {
                console.log(chalk.red(err));
                process.exit(0);
            });
        });

        return tk;
    }

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: dt.watch, group: dt.group }, factory);
}


