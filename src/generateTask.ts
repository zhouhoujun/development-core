import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as chalk from 'chalk';

import { ITaskResult, Pipe, IDynamicTask, IEnvOption, Operation, ITaskConfig, Task } from './TaskConfig';
import { taskSourceVal, taskStringVal } from './utils';

/**
 * dynamic build tasks.
 * 
 * @export
 * @param {(DynamicTask | DynamicTask[])} tasks
 * @param {Operation} oper
 * @returns {Task[]}
 */
export function generateTask(tasks: IDynamicTask | IDynamicTask[], oper: Operation, env: IEnvOption): Task[] {
    let taskseq: Task[] = [];
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
    return (gulp: Gulp, cfg: ITaskConfig) => {
        let tk = cfg.subTaskName(taskStringVal(dt.name, cfg.oper));
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            return dt.task(cfg, dt, gulp);
        });
        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk
    };
}
/**
 * create dynamic watch task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createWatchTask(dt: IDynamicTask) {
    return (gulp: Gulp, cfg: ITaskConfig) => {
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
        let tk = cfg.subTaskName(taskStringVal(dt.name, cfg.oper));
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            console.log('watch, src:', chalk.cyan.call(chalk, cfg.option.src));
            gulp.watch(taskSourceVal(cfg.option.src, cfg.oper), watchs)
        });

        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk;
    };
}
function createPipesTask(dt: IDynamicTask) {
    return (gulp: Gulp, cfg: ITaskConfig) => {

        let tk = cfg.subTaskName(taskStringVal(dt.name, cfg.oper));
        console.log('register pipes  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = Promise.resolve(gulp.src(taskSourceVal(dt.src, cfg.oper) || taskSourceVal(cfg.option.src, cfg.oper)));
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

        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk;
    }
}
