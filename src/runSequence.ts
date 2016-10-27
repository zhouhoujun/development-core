import * as _ from 'lodash';
import { Gulp } from 'gulp';
import * as chalk from 'chalk';
import { Src, Operation, ITaskResult, TaskSequence, ITaskConfig, Task } from './TaskConfig';
/**
 * convert setup task result to run sequence src.
 * 
 * @export
 * @param {TaskSequence} tasks
 * @param {Operation} oper
 * @returns {Src[]}
 */
export function toSequence(tasks: TaskSequence, oper: Operation): Src[] {
    let seq: Src[] = [];
    tasks = _.filter(tasks, it => it);
    let len = tasks.length;
    tasks = _.orderBy(tasks, t => {
        if (t) {
            if (_.isString(t)) {
                return len;
            } else if (_.isArray(t)) {
                return len;
            } else {
                return (<ITaskResult>t).order
            }
        }
        return len;
    });


    _.each(tasks, t => {
        if (!t) {
            return;
        }
        if (_.isString(t)) {
            seq.push(t);
        } else if (_.isArray(t)) {
            seq.push(_.flatten(toSequence(t, oper)));
        } else {
            if (t.name) {
                if (t.oper) {
                    if ((t.oper & oper) > 0) {
                        seq.push(t.name);
                    }
                } else {
                    seq.push(t.name);
                }
            }
        }
    });
    return seq;
}

/**
 * run task sequence.
 * 
 * @protected
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @returns {Promise<any>}
 * 
 * @memberOf Development
 */
export function runSequence(gulp: Gulp, tasks: Src[]): Promise<any> {
    let ps = Promise.resolve();
    if (tasks && tasks.length > 0) {
        _.each(tasks, task => {
            ps = ps.then(() => {
                let taskErr = null, taskStop = null;
                return new Promise((reslove, reject) => {
                    let tskmap: any = {};
                    _.each(_.isArray(task) ? task : [task], t => {
                        tskmap[t] = false;
                    });
                    taskErr = (err) => {
                        process.exit(err);
                        console.error(chalk.red(err));
                        reject(err);
                    };
                    taskStop = (e: any) => {
                        tskmap[e.task] = true;
                        if (!_.some(_.values(tskmap), it => !it)) {
                            reslove();
                        }
                    }
                    gulp.on('task_stop', taskStop)
                        .on('task_err', taskErr);
                    gulp.start(task);
                })
                    .then(() => {
                        if (gulp['removeListener']) {
                            gulp['removeListener']('task_stop', taskStop);
                            gulp['removeListener']('task_err', taskErr);
                        }
                    })
                    .catch(err => {
                        if (gulp['removeListener']) {
                            gulp['removeListener']('task_stop', taskStop);
                            gulp['removeListener']('task_err', taskErr);
                        }
                    });
            });
        });
    }
    return ps.catch(err => {
        console.error(chalk.red(err));
    });
}

/**
 * run task sequence
 * 
 * @export
 * @param {Gulp} gulp
 * @param {Task[]} tasks
 * @param {TaskConfig} config
 * @returns {Promise<any>}
 */
export function runTaskSequence(gulp: Gulp, tasks: Task[], config: ITaskConfig): Promise<any> {
    let taskseq = toSequence(_.map(tasks, tk => {
        return tk(gulp, config);
    }), config.oper);
    return runSequence(gulp, taskseq);
}
