"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ = require('lodash');
var chalk = require('chalk');
var TaskConfig_1 = require('./TaskConfig');
var utils_1 = require('./utils');
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
    tasks = utils_1.sortOrder(tasks, function (t) {
        return t.getInfo().order;
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
                registerTasks(ctx, tname);
                seq.push(tname);
            }
        }
    });
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
        registerTasks(ctx, watchname);
        seq.push(watchname);
    }
    return seq;
}
exports.toSequence = toSequence;
function registerTasks(ctx, tasks) {
    ctx.globals.tasks = ctx.globals.tasks || {};
    if (_.isArray(tasks)) {
        _.each(tasks, function (t) {
            return registerGlobals(ctx, t);
        });
    } else {
        registerGlobals(ctx, tasks);
    }
}
function hasRegistered(ctx, task) {
    ctx.globals.tasks = ctx.globals.tasks || {};
    return ctx.globals.tasks[task] ? true : false;
}
function registerGlobals(ctx, task) {
    if (ctx.globals.tasks[task]) {
        console.error(chalk.red('has same task:'), chalk.cyan(task));
        process.exit(0);
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
 * @returns
 */
function taskSequenceWatch(gulp, tasks, ctx, express) {
    // create watch task.
    if (ctx.oper & TaskConfig_1.Operation.watch && ctx.option.watch) {
        var _ret = function () {
            var wats = [];
            var name = '';
            if (_.isBoolean(ctx.option.watch)) {
                var toWatchSeq = filterTaskSequence(tasks, express);
                name = zipSequence(gulp, toWatchSeq, ctx);
                name && wats.push(name);
            } else {
                wats = ctx.option.watch;
            }
            if (wats.length > 0) {
                name = name ? name + '-owatch' : 'owatch';
                gulp.task(name, function () {
                    var src = ctx.getSrc();
                    console.log('watch, src:', chalk.cyan.call(chalk, src));
                    gulp.watch(src, wats);
                });
                return {
                    v: name
                };
            }
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    return '';
}
exports.taskSequenceWatch = taskSequenceWatch;
function registerZipTask(gulp, name, tasks, ctx) {
    var i = 0;
    var taskname = name;
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
    gulp.task(taskname, function () {
        return runSequence(gulp, tasks);
    });
    return taskname;
}
/**
 * zip tasks to a single task.
 *
 * @export
 * @param {Gulp} gulp
 * @param {string[]} tasks tasks sequence
 * @param {ITaskContext} ctx
 * @returns {string}
 */
function zipSequence(gulp, tasks, ctx) {
    if (tasks.length > 1) {
        var first = _.first(tasks);
        first = _.isArray(first) ? _.first(first) : first;
        var last = _.last(tasks);
        last = _.isArray(last) ? _.last(last) : last;
        var name = first + '-' + last + '-seq';
        return registerZipTask(gulp, name, tasks, ctx);
    } else if (tasks.length === 1) {
        var _first = _.first(tasks);
        if (_.isArray(_first)) {
            if (_first.length > 1) {
                var fs = _.first(_first);
                var ls = _.last(_first);
                var _name = fs + '-' + ls + '-paral';
                return registerZipTask(gulp, _name, tasks, ctx);
            } else {
                return _.first(_first) || '';
            }
        } else {
            return _first || '';
        }
    }
    return '';
}
exports.zipSequence = zipSequence;
/**
 * flatten task Sequence.
 *
 * @export
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @returns {string[]}
 */
function flattenSequence(gulp, tasks, ctx) {
    var result = [];
    _.each(tasks, function (tk) {
        if (_.isArray(tk)) {
            var zipSrc = _.some(tk, function (t) {
                return _.isArray(t);
            }) ? tk : [tk];
            var taskname = zipSequence(gulp, zipSrc, ctx);
            taskname && result.push(taskname);
        } else {
            result.push(tk);
        }
    });
    return result;
}
exports.flattenSequence = flattenSequence;
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
        var order = 1;
        var len = taskSequence.length + 1;
        if (_.isNumber(rst.order)) {
            order = rst.order;
        } else if (_.isFunction(rst.order)) {
            order = rst.order(len);
        }
        if (_.isNumber(order)) {
            if (order > 0 && order < 1) {
                order = Math.round(order * len);
            } else if (order === 1) {
                order = len;
            } else if (order > len) {
                order = Math.round(order % len);
            }
        }
        if (order < 0) {
            order = 0;
        }
        if (order >= 0 && order < taskSequence.length) {
            taskSequence.splice(order, 0, rst.taskName);
        } else {
            taskSequence.push(rst.taskName);
        }
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
        // process.exit(0);
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
