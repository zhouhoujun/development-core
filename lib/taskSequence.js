"use strict";

var _ = require('lodash');
var chalk = require('chalk');
/**
 * convert setup task result to run sequence src.
 *
 * @export
 * @param {Gulp} gulp
 * @param {ITask[]} tasks
 * @param {ITaskConfig} config
 * @returns {Src[]}
 */
function toSequence(gulp, tasks, config) {
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
    _.each(tasks, function (t) {
        var info = t.getInfo();
        if (info.watch && !config.env.watch) {
            return;
        }
        if (!info.oper || info.oper && (info.oper & config.oper) > 0) {
            var tname = t.setup(config, gulp);
            tname && seq.push(tname);
        }
    });
    return seq;
}
exports.toSequence = toSequence;
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
 * @param {ITask[] | Promise<ITask[]>} tasks
 * @param {TaskConfig} config
 * @returns {Promise<any>}
 */
function runTaskSequence(gulp, tasks, config) {
    return Promise.resolve(tasks).then(function (tasks) {
        var taskseq = toSequence(gulp, tasks, config);
        return runSequence(gulp, taskseq);
    });
}
exports.runTaskSequence = runTaskSequence;
//# sourceMappingURL=sourcemaps/taskSequence.js.map
