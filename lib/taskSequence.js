"use strict";

var _ = require('lodash');
var chalk = require('chalk');
var TaskConfig_1 = require('./TaskConfig');
var generateTask_1 = require('./generateTask');
/**
 * convert setup task result to run sequence src.
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskContext} ctx
 * @returns {Src[]}
 */
function toSequence(gulp, tasks, ctx) {
    var seq = [];
    var len = tasks.length;
    if (len < 1) {
        return seq;
    }
    tasks = _.orderBy(tasks, function (t) {
        if (_.isArray(t)) {
            return len;
        } else {
            var info = t.getInfo();
            if (_.isNumber(info.order)) {
                return info.order;
            }
            return len;
        }
    });
    var hasWatchtasks = [];
    _.each(tasks, function (t) {
        var info = t.getInfo();
        if (info.oper & ctx.oper) {
            var tname = t.setup(ctx, gulp);
            if (tname) {
                if (info.oper & TaskConfig_1.Operation.watch) {
                    hasWatchtasks.push(tname);
                }
                seq.push(tname);
            }
        }
    });
    console.log();
    var watchname = taskSequenceWatch(gulp, seq, ctx, function (it) {
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
exports.toSequence = toSequence;
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
function taskSequenceWatch(gulp, tasks, ctx, express) {
    // create watch task.
    if (ctx.oper & TaskConfig_1.Operation.watch && ctx.option.watch) {
        var wats = [];
        var name = '';
        if (_.isBoolean(ctx.option.watch)) {
            (function () {
                var toWatchSeq = filterTaskSequence(tasks, express);
                if (toWatchSeq.length > 1) {
                    var first = _.first(toWatchSeq);
                    first = _.isArray(first) ? _.first(first) : first;
                    var last = _.last(toWatchSeq);
                    last = _.isArray(last) ? _.last(last) : last;
                    name = first + '-' + last;
                    var taskname = name + '-seq';
                    gulp.task(ctx.subTaskName(taskname), function () {
                        return runSequence(gulp, toWatchSeq);
                    });
                    wats.push(taskname);
                } else if (toWatchSeq.length === 1) {
                    var _first = _.first(toWatchSeq);
                    if (_.isArray(_first)) {
                        var fs = _.first(_first);
                        var ls = _.last(_first);
                        name = fs + '-' + ls;
                        wats = _first;
                    } else if (_first) {
                        name = _first;
                        wats.push(_first);
                    }
                }
            })();
        } else {
            wats = ctx.option.watch;
        }
        if (wats.length > 0) {
            name = name ? name + '-watch' : 'watch';
            var watchtask = generateTask_1.createTask({ oper: TaskConfig_1.Operation.defaultWatch, name: name, watchTasks: wats });
            return watchtask.setup(ctx, gulp);
        }
    }
    return '';
}
exports.taskSequenceWatch = taskSequenceWatch;
/**
 * add task to task sequence.
 *
 * @export
 * @param {Src[]} taskSequence
 * @param {ITaskInfo} rst
 * @returns
 */
function addToSequence(taskSequence, rst) {
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
exports.addToSequence = addToSequence;
/**
 * filter task sequence. make sure no empty.
 *
 * @param {Src[]} seq
 * @param {(str: string) => boolean} [filter]
 * @returns {Src[]}
 */
function filterTaskSequence(seq, express) {
    var rseq = [];
    express = express || function (it) {
        return !!it;
    };
    _.each(seq, function (it) {
        if (!it) {
            return;
        }
        if (_.isString(it) && express(it)) {
            rseq.push(it);
        } else if (_.isArray(it)) {
            rseq.push(_.filter(it, function (itm) {
                return express(itm);
            }));
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
function runSequence(gulp, tasks) {
    tasks = filterTaskSequence(tasks);
    console.log('run tasks : ', chalk.cyan(tasks));
    var run = new Promise(function (resolve, reject) {
        var ps = null;
        if (tasks && tasks.length > 0) {
            _.each(tasks, function (task) {
                if (ps) {
                    ps = ps.then(function () {
                        return startTask(gulp, task);
                    });
                } else {
                    ps = startTask(gulp, task);
                }
            });
        } else {
            ps = Promise.resolve();
        }
        return ps.then(resolve).catch(reject);
    });
    return run.catch(function (err) {
        console.error(chalk.red(err));
        process.exit(0);
    });
}
exports.runSequence = runSequence;
/**
 * start task.
 *
 * @param {Gulp} gulp
 * @param {Src} task
 * @returns {Promise<any>}
 */
function startTask(gulp, task) {
    var taskErr = null,
        taskStop = null;
    return new Promise(function (reslove, reject) {
        var tskmap = {};
        _.each(_.isArray(task) ? task : [task], function (t) {
            tskmap[t] = false;
        });
        taskErr = function taskErr(err) {
            process.exit(err);
            console.error(chalk.red(err));
            reject(err);
        };
        taskStop = function taskStop(e) {
            tskmap[e.task] = true;
            if (!_.some(_.values(tskmap), function (it) {
                return !it;
            })) {
                reslove();
            }
        };
        gulp.on('task_stop', taskStop).on('task_err', taskErr);
        gulp.start(task);
    }).then(function () {
        if (gulp['removeListener']) {
            gulp['removeListener']('task_stop', taskStop);
            gulp['removeListener']('task_err', taskErr);
        }
    }, function (err) {
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
function runTaskSequence(gulp, tasks, ctx) {
    return Promise.resolve(tasks).then(function (tasks) {
        var taskseq = toSequence(gulp, tasks, ctx);
        return runSequence(gulp, taskseq);
    });
}
exports.runTaskSequence = runTaskSequence;
//# sourceMappingURL=sourcemaps/taskSequence.js.map
