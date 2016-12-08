import * as _ from 'lodash';
import { Gulp } from 'gulp';
import * as chalk from 'chalk';
import { Src, RunWay, ITaskInfo, ITaskContext, ITask, Operation } from './TaskConfig';
import { sortOrder } from './utils';


export type ZipTaskName = (name: string, runWay?: RunWay, ctx?: ITaskContext) => string
/**
 * convert setup task result to run sequence src.
 * 
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {Src[]}
 */
export function toSequence(gulp: Gulp, tasks: ITask[], ctx: ITaskContext, zipName?: ZipTaskName): Src[] {
    let seq: Src[] = [];
    let len = tasks.length;
    if (len < 1) {
        return seq;
    }
    let taskseq = sortOrder<ITask>(tasks, t => t.getInfo().order, ctx);

    let hasWatchtasks = [];
    let callback = watch => hasWatchtasks.push(watch);
    _.each(taskseq, tk => {
        if (_.isArray(tk)) {
            let pallSeq: Src[] = [];
            _.each(tk, t => {
                pallSeq.push(setupTask(gulp, t, ctx, callback));
            });
            let ps: Src = flattenSequence(gulp, pallSeq, ctx, zipName);
            if (ps && ps.length > 0) {
                seq.push(ps);
            }
        } else {
            seq = seq.concat(setupTask(gulp, tk, ctx, callback));
        }
    });

    let watchname = taskSequenceWatch(gulp, seq, ctx, it => {
        if (!it) {
            return false;
        }
        if (hasWatchtasks.length > 0) {
            return hasWatchtasks.indexOf(it) < 0;
        }
        return true;
    }, zipName);
    if (watchname) {
        registerTasks(ctx, watchname);
        seq.push(watchname);
    }

    return seq;
}

function setupTask(gulp: Gulp, t: ITask, ctx: ITaskContext, callback: (name: Src) => void): string[] {
    let seq: string[] = [];
    let info = t.getInfo();
    if (info.oper & ctx.oper) {
        let tname = ctx.setup(t, gulp); // t.setup(ctx, gulp);
        if (tname) {
            // is watch task.
            if ((info.oper & Operation.watch)) {
                callback(tname);
            }
            registerTasks(ctx, tname);
            if (_.isArray(tname)) {
                seq = tname;
            } else {
                seq.push(tname);
            }
            // autoWatch
            if ((ctx.oper & Operation.watch) && (info.oper & Operation.autoWatch)) {
                let wname = tname + '-twatch';
                registerTasks(ctx, wname);
                gulp.task(wname, () => {
                    let src = ctx.getSrc(info);
                    console.log('watch, src:', chalk.cyan.call(chalk, src));
                    gulp.watch(src, _.isArray(tname) ? tname : [<string>tname]);
                });

                callback(wname);
                seq.push(wname);
            }
        }
    }
    return seq;
}

function registerTasks(ctx: ITaskContext, tasks: Src) {
    ctx.globals.tasks = ctx.globals.tasks || {};
    if (_.isArray(tasks)) {
        _.each(tasks, t => registerGlobals(ctx, t));
    } else {
        registerGlobals(ctx, tasks);
    }
}

function hasRegistered(ctx: ITaskContext, task: string) {
    ctx.globals.tasks = ctx.globals.tasks || {};
    return (ctx.globals.tasks[task]) ? true : false;
}

function registerGlobals(ctx: ITaskContext, task: string) {
    if (ctx.globals.tasks[task]) {
        console.error(chalk.red('has same task:'), chalk.cyan(task));
    } else {
        ctx.globals.tasks[task] = task;
    }
}

/**
 * generate watch task for sequence
 * 
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {(str: string) => boolean} [express]
 * @param {ZipTaskName} [zipName]
 * @returns {string}
 */
export function taskSequenceWatch(gulp: Gulp, tasks: Src[], ctx: ITaskContext, express?: (str: string) => boolean, zipName?: ZipTaskName): string {
    // create watch task.
    if ((ctx.oper & Operation.watch) && ctx.option.watch) {
        let wats = [];
        let name = '';
        if (_.isBoolean(ctx.option.watch)) {
            let toWatchSeq = filterTaskSequence(tasks, express);
            name = zipSequence(gulp, toWatchSeq, ctx, zipName);
            name && wats.push(name);
        } else {
            wats = ctx.option.watch;
        }

        if (wats.length > 0) {
            name = name ? name + '-owatch' : 'owatch';
            gulp.task(name, () => {
                let src = ctx.getSrc();
                console.log('watch, src:', chalk.cyan.call(chalk, src));
                gulp.watch(src, wats)
            });
            return name;
        }
    }
    return '';
}

function registerZipTask(gulp: Gulp, name: string, tasks: Src[], ctx: ITaskContext) {
    let i = 0;
    let taskname = name;
    while (hasRegistered(ctx, taskname) && i < 50) {
        taskname = name + i;
        console.log('try register name: ', chalk.cyan(taskname));
        i++;
    }
    if (i >= 50) {
        console.error(chalk.red('has same task:'), chalk.cyan(name), 'too many times.');
        return '';
    }

    registerGlobals(ctx, taskname);
    gulp.task(taskname, () => {
        return runSequence(gulp, tasks);
    });
    return taskname;
}

/**
 * zip tasks to a single task.
 * 
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {string}
 */
export function zipSequence(gulp: Gulp, tasks: Src[], ctx: ITaskContext, zipName?: ZipTaskName): string {
    if (tasks.length > 1) {
        let first = _.first(tasks);
        first = _.isArray(first) ? _.first(first) : first;
        let last = _.last(tasks);
        last = _.isArray(last) ? _.last(last) : last;
        let name = `${first}-${last}`;
        name = zipName ? zipName(name, RunWay.sequence, ctx) : name + '-seq';
        return registerZipTask(gulp, name, tasks, ctx);

    } else if (tasks.length === 1) {
        let first = _.first(tasks);
        if (_.isArray(first)) {
            if (first.length > 1) {
                let fs = _.first(first);
                let ls = _.last(first);
                let name = `${fs}-${ls}`;
                name = zipName ? zipName(name, RunWay.parallel, ctx) : name + '-paral';
                return registerZipTask(gulp, name, tasks, ctx);
            } else {
                return _.first(first) || '';
            }
        } else {
            return first || '';
        }
    }

    return '';
}

/**
 * flatten task Sequence.
 * 
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {string[]}
 */
export function flattenSequence(gulp: Gulp, tasks: Src[], ctx: ITaskContext, zipName?: ZipTaskName): string[] {
    let result: string[] = [];
    _.each(tasks, tk => {
        if (_.isArray(tk)) {
            let zipSrc: Src[] = (_.some(tk, t => _.isArray(t))) ? tk : [tk];
            let taskname = zipSequence(gulp, zipSrc, ctx, zipName);
            taskname && result.push(taskname);
        } else {
            result.push(tk);
        }
    });

    return result;
}

/**
 * add task to task sequence.
 * 
 * @export
 * @param {Src[]} taskSequence
 * @param {ITaskInfo} rst
 * @param {ITaskContext} [ctx]
 * @returns {Src[]}
 */
export function addToSequence(taskSequence: Src[], rst: ITaskInfo, ctx?: ITaskContext): Src[] {
    if (!rst) {
        return taskSequence;
    }
    if (rst.taskName) {
        let order = 1;
        let len = taskSequence.length + 1;
        if (_.isNumber(rst.order)) {
            order = rst.order;
        } else if (_.isFunction(rst.order)) {
            let val = rst.order(len, ctx);
            order = _.isNumber(val) ? val : val.value
        } else if (rst.order && _.isNumber(rst.order.value)) {
            order = rst.order.value;
        }


        if (order > 0 && order < 1) {
            order = order * len;
        } else if (order === 1) {
            order = len;
        } else if (order > len) {
            order = order % len;
        }

        order = parseInt(order.toFixed(0));

        if (order < 0) {
            order = 0;
        }

        let seqMax = len - 2;
        console.log(order);
        if (order >= 0 && order <= seqMax) {
            taskSequence.splice(order, 0, rst.taskName);
        } else if (order > seqMax && order < len) {
            taskSequence.splice(seqMax - (seqMax - order), 0, rst.taskName);
        } else {
            taskSequence.push(rst.taskName);
        }
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
    console.log(chalk.cyan('run tasks : '), tasks);
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
        // process.exit(0);
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
            if (tskmap[e.task] === false) {
                tskmap[e.task] = true;
            }
            if (!_.some(_.values(tskmap), it => !it)) {
                reslove();
            }
        }
        if (gulp['setMaxListeners']) {
            gulp['setMaxListeners'](100);
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


// function start(gulp: Gulp, taskname: string): Promise<any> {
//     let taskErr = null, taskStop = null;
//     return new Promise((reslove, reject) => {
//         taskErr = (err) => {
//             process.exit(err);
//             console.error(chalk.red(err));
//             reject(err);
//         };
//         taskStop = (e: any) => {
//             if (e.task === taskname) {
//                 reslove();
//             }
//         }
//         gulp.on('task_stop', taskStop)
//             .on('task_err', taskErr);
//         gulp.start(taskname);
//     })
//         .then(() => {
//             if (gulp['removeListener']) {
//                 gulp['removeListener']('task_stop', taskStop);
//                 gulp['removeListener']('task_err', taskErr);
//             }
//         }, err => {
//             if (gulp['removeListener']) {
//                 gulp['removeListener']('task_stop', taskStop);
//                 gulp['removeListener']('task_err', taskErr);
//             }
//             // process.exit(0);
//         });
// }

/**
 * run task sequence
 * 
 * @export
 * @param {Gulp} gulp
 * @param {(ITask[] | Promise<ITask[]>)} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {Promise<any>}
 */
export function runTaskSequence(gulp: Gulp, tasks: ITask[] | Promise<ITask[]>, ctx: ITaskContext, zipName?: ZipTaskName): Promise<any> {
    return Promise.resolve(tasks)
        .then(tasks => {
            let taskseq = toSequence(gulp, tasks, ctx, zipName);
            return runSequence(gulp, taskseq);
        });
}
