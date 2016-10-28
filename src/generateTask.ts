import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';

import { ITaskInfo, TaskResult, Pipe, IDynamicTask, IEnvOption, Operation, ITaskConfig, ITask } from './TaskConfig';

type factory = (config: ITaskConfig, gulp: Gulp) => TaskResult;
class DynamicTask implements ITask {
    constructor(public decorator: ITaskInfo, private factory: factory) {
    }
    setup(config: ITaskConfig, gulp?: Gulp) {
        let name = this.factory(config, gulp || coregulp);
        if (name) {
            this.decorator.name = name;
        }
        return name;
    }
}

/**
 * dynamic build tasks.
 * 
 * @export
 * @param {(DynamicTask | DynamicTask[])} tasks
 * @param {Operation} oper
 * @returns {ITask[]}
 */
export function generateTask(tasks: IDynamicTask | IDynamicTask[], oper: Operation, env: IEnvOption): ITask[] {
    let taskseq: ITask[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {
        if (dt.oper && (dt.oper & oper) <= 0) {
            return;
        }
        if (dt.watch) {
            if (!env.watch) {
                return;
            }
            taskseq.push(createWatchTask(dt));
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

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: !!dt.watch }, factory);
}
/**
 * create dynamic watch task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createWatchTask(dt: IDynamicTask) {
    let factory = (cfg: ITaskConfig, gulp: Gulp) => {
        let watchs = _.isFunction(dt.watch) ? dt.watch(cfg) : dt.watch;
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

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: !!dt.watch }, factory);
}
function createPipesTask(dt: IDynamicTask) {
    let factory = (cfg: ITaskConfig, gulp: Gulp) => {

        let tk = cfg.subTaskName(dt);
        console.log('register pipes  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = Promise.resolve(gulp.src(cfg.getSrc(dt)));
            if (dt.pipes) {
                let pipes = _.isFunction(dt.pipes) ? dt.pipes(cfg, dt) : dt.pipes;
                _.each(pipes, (p: Pipe) => {
                    src = src.then(psrc => {
                        return Promise.resolve((_.isFunction(p) ? p(cfg, dt, gulp) : p))
                            .then(stram => {
                                return psrc.pipe(stram)
                            });
                    });
                })
            } else if (dt.pipe) {
                src = src.then((stream => {
                    return dt.pipe(stream, cfg, dt);
                }));
            }
            src.then(stream => {
                if (dt.output) {
                    let outputs = _.isFunction(dt.output) ? dt.output(cfg, dt) : dt.output;
                    return Promise.all(_.map(outputs, output => {
                        return new Promise((resolve, reject) => {
                            Promise.resolve<NodeJS.ReadWriteStream>((_.isFunction(output) ? output(stream, cfg, dt, gulp) : output))
                                .then(output => {
                                    stream.pipe(output)
                                        .once('end', resolve)
                                        .once('error', reject);
                                });

                        });
                    }));
                } else {
                    return new Promise((resolve, reject) => {
                        stream.pipe(gulp.dest(cfg.getDist(dt)))
                            .once('end', resolve)
                            .once('error', reject);
                    });
                }
            });
            return src.catch(err => {
                console.log(chalk.red(err));
            });
        });

        return tk;
    }

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: !!dt.watch }, factory);
}
