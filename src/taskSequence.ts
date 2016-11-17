import * as _ from 'lodash';
import { Gulp } from 'gulp';
import * as chalk from 'chalk';
import { Src, ITaskInfo, ITaskContext, ITask, Operation } from './TaskConfig';
import { createTask } from './generateTask';
/**
 * convert setup task result to run sequence src.
 * 
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskContext} ctx
 * @returns {Src[]}
 */
export function toSequence(gulp: Gulp, tasks: ITask[], ctx: ITaskContext): Src[] {
    let seq: Src[] = [];
    let len = tasks.length;
    if (len < 1) {
        return seq;
    }

    tasks = _.orderBy(tasks, t => {
        if (_.isArray(t)) {
            return len;
        } else {
            let info = t.getInfo();
            if (_.isNumber(info.order)) {
                return info.order;
            }
            return len;
        }
    });

    let hasWatchtasks = [];
    _.each(tasks, t => {
        let info = t.getInfo();
        if (info.oper & ctx.oper) {
            let tname = t.setup(ctx, gulp);
            if (tname) {
                if ((info.oper & Operation.watch)) {
                    hasWatchtasks.push(tname);
                }
                seq.push(tname);
            }
        }
    });

    console.log()
    let watchname = taskSequenceWatch(gulp, seq, ctx, it => {
        if (!it) {
            return false;
        }
        if (hasWatchtasks.length > 0) {
            return hasWatchtasks.indexOf(it) < 0;
        }
        return true;
    });
    if (watchname) {
        seq.push(watchname);
    }

    return seq;
}

/**
 * generate watch task for sequence
 * 
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {(str: string) => boolean} [express]
 * @returns
 */
export function taskSequenceWatch(gulp: Gulp, tasks: Src[], ctx: ITaskContext, express?: (str: string) => boolean) {
    // create watch task.
    if ((ctx.oper & Operation.watch) && ctx.option.watch) {
        let wats = [];
        let name = '';
        if (_.isBoolean(ctx.option.watch)) {
            let toWatchSeq = filterTaskSequence(tasks, express)

            if (toWatchSeq.length > 1) {
                let first = _.first(toWatchSeq);
                first = _.isArray(first) ? _.first(first) : first;
                let last = _.last(toWatchSeq);
                last = _.isArray(last) ? _.last(last) : last;
                name = `${first}-${last}`;
                let taskname = name + '-seq';
                gulp.task(ctx.subTaskName(taskname), () => {
                    return runSequence(gulp, toWatchSeq);
                });
                wats.push(taskname);
            } else if (toWatchSeq.length === 1) {
                let first = _.first(toWatchSeq);
                if (_.isArray(first)) {
                    let fs = _.first(first);
                    let ls = _.last(first);
                    name = `${fs}-${ls}`;
                    wats = first;
                } else if (first) {
                    name = first;
                    wats.push(first);
                }
            }

        } else {
            wats = ctx.option.watch;
        }

        if (wats.length > 0) {
            name = name ? name + '-watch' : 'watch';
            let watchtask = createTask({ oper: Operation.defaultWatch, name: name, watchTasks: wats });
            return watchtask.setup(ctx, gulp);
        }
    }
    return '';
}

/**
 * add task to task sequence.
 * 
 * @export
 * @param {Src[]} taskSequence
 * @param {ITaskInfo} rst
 * @returns
 */
export function addToSequence(taskSequence: Src[], rst: ITaskInfo) {
    if (!rst) {
        return taskSequence;
    }
    if (rst.taskName) {
        if (_.isNumber(rst.order) && rst.order >= 0 && rst.order < taskSequence.length) {
            taskSequence.splice(rst.order, 0, rst.taskName);
            return taskSequence;
        }
        taskSequence.push(rst.taskName);
    }
    return taskSequence;
}


/**
 * filter task sequence. make sure no empty.
 * 
 * @param {Src[]} seq
 * @param {(str: string) => boolean} [filter]
 * @returns {Src[]}
 */
function filterTaskSequence(seq: Src[], express?: (str: string) => boolean): Src[] {
    let rseq: Src[] = [];
    express = express || ((it) => !!it);
    _.each(seq, it => {
        if (!it) {
            return;
        }
        if (_.isString(it) && express(it)) {
            rseq.push(it);
        } else if (_.isArray(it)) {
            rseq.push(_.filter(it, itm => express(itm)));
        }
    });
    return rseq;
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
    tasks = filterTaskSequence(tasks);
    console.log('run tasks : ', chalk.cyan(<any>tasks));
    let run = new Promise((resolve, reject) => {
        let ps: Promise<any> = null;
        if (tasks && tasks.length > 0) {
            _.each(tasks, task => {
                if (ps) {
                    ps = ps.then(() => {
                        return startTask(gulp, task);
                    })
                } else {
                    ps = startTask(gulp, task);
                }
            });
        } else {
            ps = Promise.resolve();
        }
        return ps
            .then(resolve)
            .catch(reject);
    });
    return run.catch(err => {
        console.error(chalk.red(err));
        process.exit(0);
    });
}

/**
 * start task.
 * 
 * @param {Gulp} gulp
 * @param {Src} task
 * @returns {Promise<any>}
 */
function startTask(gulp: Gulp, task: Src): Promise<any> {
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
        }, err => {
            if (gulp['removeListener']) {
                gulp['removeListener']('task_stop', taskStop);
                gulp['removeListener']('task_err', taskErr);
            }
            // process.exit(0);
        });
}

/**
 * run task sequence
 * 
 * @export
 * @param {Gulp} gulp
 * @param {(ITask[] | Promise<ITask[]>)} tasks
 * @param {ITaskContext} ctx
 * @returns {Promise<any>}
 */
export function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, ctx: ITaskContext): Promise<any> {
    return Promise.resolve(tasks)
        .then(tasks => {
            let taskseq = toSequence(gulp, tasks, ctx);
            return runSequence(gulp, taskseq);
        });
}
