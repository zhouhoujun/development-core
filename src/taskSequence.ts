import * as _ from 'lodash';
import { Gulp } from 'gulp';
import * as chalk from 'chalk';
import { Src, ITaskInfo, ITaskContext, ITask } from './TaskConfig';

/**
 * convert setup task result to run sequence src.
 * 
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskConfig} config
 * @returns {Src[]}
 */
export function toSequence(gulp: Gulp, tasks: ITask[], config: ITaskContext): Src[] {
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

    _.each(tasks, t => {
        let info = t.getInfo();
        if (info.watch && !config.env.watch) {
            return;
        }

        if (!info.oper ||
            (info.oper && (info.oper & config.oper) > 0)) {
            let tname = t.setup(config, gulp);
            tname && seq.push(tname);
        }

    });

    return seq;
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
 * @param {ITask[] | Promise<ITask[]>} tasks
 * @param {TaskConfig} config
 * @returns {Promise<any>}
 */
export function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, config: ITaskContext): Promise<any> {
    return Promise.resolve(tasks)
        .then(tasks => {
            let taskseq = toSequence(gulp, tasks, config);
            return runSequence(gulp, taskseq);
        });
}
