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
 * @param {ZipTaskName} [zipName]
 * @returns {Src[]}
 */
function toSequence(gulp, tasks, ctx, zipName) {
    var seq = [];
    var len = tasks.length;
    if (len < 1) {
        return seq;
    }
    var taskseq = utils_1.sortOrder(tasks, function (t) {
        return t.getInfo().order;
    }, ctx);
    var hasWatchtasks = [];
    var callback = function callback(watch) {
        return hasWatchtasks.push(watch);
    };
    _.each(taskseq, function (tk) {
        if (_.isArray(tk)) {
            (function () {
                var pallSeq = [];
                _.each(tk, function (t) {
                    pallSeq.push(setupTask(gulp, t, ctx, callback));
                });
                var ps = flattenSequence(gulp, pallSeq, ctx, zipName);
                if (ps && ps.length > 0) {
                    seq.push(ps);
                }
            })();
        } else {
            seq = seq.concat(setupTask(gulp, tk, ctx, callback));
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
    }, zipName);
    if (watchname) {
        registerTasks(ctx, watchname);
        seq.push(watchname);
    }
    return seq;
}
exports.toSequence = toSequence;
function setupTask(gulp, t, ctx, callback) {
    var seq = [];
    var info = t.getInfo();
    if (info.oper & ctx.oper) {
        (function () {
            var tname = ctx.setup(t, gulp); // t.setup(ctx, gulp);
            if (tname) {
                // is watch task.
                if (info.oper & TaskConfig_1.Operation.watch) {
                    callback(tname);
                }
                registerTasks(ctx, tname);
                if (_.isArray(tname)) {
                    seq = tname;
                } else {
                    seq.push(tname);
                }
                // autoWatch
                if (ctx.oper & TaskConfig_1.Operation.watch && info.oper & TaskConfig_1.Operation.autoWatch) {
                    var wname = tname + '-twatch';
                    registerTasks(ctx, wname);
                    gulp.task(wname, function () {
                        var src = ctx.getSrc(info);
                        console.log('watch, src:', chalk.cyan.call(chalk, src));
                        gulp.watch(src, _.isArray(tname) ? tname : [tname]);
                    });
                    callback(wname);
                    seq.push(wname);
                }
            }
        })();
    }
    return seq;
}
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
function taskSequenceWatch(gulp, tasks, ctx, express, zipName) {
    // create watch task.
    if (ctx.oper & TaskConfig_1.Operation.watch && ctx.option.watch) {
        var _ret3 = function () {
            var wats = [];
            var name = '';
            if (_.isBoolean(ctx.option.watch)) {
                var toWatchSeq = filterTaskSequence(tasks, express);
                name = zipSequence(gulp, toWatchSeq, ctx, zipName);
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

        if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
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
 * @param {Src[]} tasks
 * @param {ITaskContext} ctx
 * @param {ZipTaskName} [zipName]
 * @returns {string}
 */
function zipSequence(gulp, tasks, ctx, zipName) {
    if (tasks.length > 1) {
        var first = _.first(tasks);
        first = _.isArray(first) ? _.first(first) : first;
        var last = _.last(tasks);
        last = _.isArray(last) ? _.last(last) : last;
        var name = first + '-' + last;
        name = zipName ? zipName(name, TaskConfig_1.RunWay.sequence, ctx) : name + '-seq';
        return registerZipTask(gulp, name, tasks, ctx);
    } else if (tasks.length === 1) {
        var _first = _.first(tasks);
        if (_.isArray(_first)) {
            if (_first.length > 1) {
                var fs = _.first(_first);
                var ls = _.last(_first);
                var _name = fs + '-' + ls;
                _name = zipName ? zipName(_name, TaskConfig_1.RunWay.parallel, ctx) : _name + '-paral';
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
 * @param {ZipTaskName} [zipName]
 * @returns {string[]}
 */
function flattenSequence(gulp, tasks, ctx, zipName) {
    var result = [];
    _.each(tasks, function (tk) {
        if (_.isArray(tk)) {
            var zipSrc = _.some(tk, function (t) {
                return _.isArray(t);
            }) ? tk : [tk];
            var taskname = zipSequence(gulp, zipSrc, ctx, zipName);
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
 * @param {ITaskContext} [ctx]
 * @returns {Src[]}
 */
function addToSequence(taskSequence, rst, ctx) {
    if (!rst) {
        return taskSequence;
    }
    if (rst.taskName) {
        var order = 1;
        var len = taskSequence.length + 1;
        if (_.isNumber(rst.order)) {
            order = rst.order;
        } else if (_.isFunction(rst.order)) {
            var val = rst.order(len, ctx);
            order = _.isNumber(val) ? val : val.value;
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
        var seqMax = len - 2;
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
    console.log(chalk.cyan('run tasks : '), tasks);
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
            if (tskmap[e.task] === false) {
                tskmap[e.task] = true;
            }
            if (!_.some(_.values(tskmap), function (it) {
                return !it;
            })) {
                reslove();
            }
        };
        if (gulp['setMaxListeners']) {
            gulp['setMaxListeners'](100);
        }
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
function runTaskSequence(gulp, tasks, ctx, zipName) {
    return Promise.resolve(tasks).then(function (tasks) {
        var taskseq = toSequence(gulp, tasks, ctx, zipName);
        return runSequence(gulp, taskseq);
    });
}
exports.runTaskSequence = runTaskSequence;
//# sourceMappingURL=sourcemaps/taskSequence.js.map
