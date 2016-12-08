"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('reflect-metadata');
var _ = require('lodash');
var chalk = require('chalk');
var generateTask_1 = require('./generateTask');
var bindingConfig_1 = require('./bindingConfig');
var utils_1 = require('./utils');
var fs_1 = require('fs');
var requireDir = require('require-dir');
/**
 * task decorator.
 *
 * @export
 * @param {ITaskDecorator} type
 * @returns
 */
function task(target) {
    if (_.isFunction(target)) {
        target['__task'] = {};
        return target;
    } else {
        var _ret = function () {
            var tg = target;
            return {
                v: function v(target) {
                    target['__task'] = tg || {};
                    return target;
                }
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
}
exports.task = task;
/**
 * dynamic task decorator.
 *
 * @export
 * @template T
 * @param {((new <T>() => T) | ITaskDecorator)} [target]
 * @returns {*}
 */
function dynamicTask(target) {
    if (target && _.isFunction(target)) {
        target['__dynamictask'] = {};
        return target;
    } else {
        var _ret2 = function () {
            var tg = target;
            return {
                v: function v(target) {
                    target['__dynamictask'] = tg || {};
                    return target;
                }
            };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
}
exports.dynamicTask = dynamicTask;
function findTaskset(tasks, target, match, ctx) {
    if (!target) {
        return;
    }
    if (_.isFunction(target)) {
        if (target['__task']) {
            var tinfo = target['__task'];
            tinfo = _.isBoolean(tinfo) ? {} : tinfo;
            if (!utils_1.matchCompare(tinfo, match, ctx)) {
                return;
            }
            if (tasks.has(target)) {
                return;
            }
            var _task = new target(tinfo);
            if (_task.setInfo) {
                _task.setInfo(tinfo);
            }
            tasks.set(target, _task);
        } else if (target['__dynamictask']) {
            var _ret3 = function () {
                var tinfo = target['__dynamictask'];
                if (!utils_1.matchCompare(tinfo, match, ctx)) {
                    return {
                        v: void 0
                    };
                }
                if (tasks.has(target)) {
                    return {
                        v: void 0
                    };
                }
                var dyts = _.map(new target().tasks(), function (tk) {
                    tk = _.extend(_.clone(tinfo), tk);
                    // tk.group = tk.group || tinfo.group;
                    return tk;
                });
                tasks.set(target, generateTask_1.generateTask(dyts, match, ctx));
            }();

            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
        }
    } else if (_.isArray(target)) {
        _.each(target, function (sm) {
            findTaskset(tasks, sm, match, ctx);
        });
    } else {
        _.each(_.keys(target), function (key) {
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return;
            }
            console.log(chalk.grey('find task from :'), chalk.cyan(key));
            findTaskset(tasks, target[key], match, ctx);
        });
    }
}
function findTaskMap(target, match, ctx, map) {
    map = map || new Map();
    findTaskset(map, target, match, ctx);
    var tasks = [];
    map.forEach(function (it) {
        if (_.isArray(it)) {
            tasks = tasks.concat(it);
        } else {
            tasks.push(it);
        }
    });
    return tasks;
}
/**
 * find tasks in Object module.
 *
 * @export
 * @param {*} target
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {ITask[]}
 */
function findTasks(target, match, ctx) {
    return findTaskMap(target, match, ctx);
}
exports.findTasks = findTasks;
/**
 * decorator task define implements IContextDefine.
 *
 * @export
 * @param {Function} constructor
 */
function taskdefine(target) {
    if (_.isFunction(target)) {
        target['__task_context'] = true;
        return target;
    } else {
        var _ret4 = function () {
            var tg = target;
            return {
                v: function v(target) {
                    target['__task_context'] = tg || true;
                    return target;
                }
            };
        }();

        if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
    }
}
exports.taskdefine = taskdefine;
/**
 * get all taskdefine in module.
 *
 * @export
 * @param {any} target
 * @returns
 */
function findTaskDefines(target) {
    var defs = [];
    if (!target) {
        return defs;
    }
    if (_.isFunction(target)) {
        if (target['__task_context']) {
            var dc = new target();
            if (!dc['getContext']) {
                dc = taskDefine2Context(dc);
            }
            defs.push(dc);
        }
    } else if (_.isArray(target)) {
        _.each(target, function (sm) {
            defs.concat(findTaskDefines(sm));
        });
    } else {
        _.each(_.keys(target), function (key) {
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return;
            }
            console.log(chalk.grey('find task define from :'), chalk.cyan(key));
            defs = defs.concat(findTaskDefines(target[key]));
        });
    }
    return defs;
}
exports.findTaskDefines = findTaskDefines;
/**
 * get one taskdefine in module.
 *
 * @export
 * @param {any} target
 * @returns
 */
function findTaskDefine(target) {
    var def = void 0;
    if (!target) {
        return null;
    }
    if (_.isFunction(target)) {
        if (target['__task_context']) {
            var dc = new target();
            if (dc['getContext']) {
                def = dc;
            } else {
                def = taskDefine2Context(dc);
            }
        }
    } else if (_.isArray(target)) {
        _.each(target, function (sm) {
            if (def) {
                return false;
            }
            def = findTaskDefine(sm);
            return true;
        });
    } else {
        _.each(_.keys(target), function (key) {
            if (def) {
                return false;
            }
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return true;
            }
            console.log(chalk.grey('find task define from :'), chalk.cyan(key));
            def = findTaskDefine(target[key]);
            return true;
        });
    }
    return def;
}
exports.findTaskDefine = findTaskDefine;
/**
 * find one taskdefine in module.
 *
 * @export
 * @param {(string | Object)} md
 * @returns {Promise<IContextDefine>}
 */
function findTaskDefineInModule(md) {
    var tsdef = void 0;
    try {
        if (_.isString(md)) {
            tsdef = findTaskDefine(require(md));
        } else {
            tsdef = findTaskDefine(md);
        }
    } catch (err) {
        return Promise.reject(err);
    }
    if (tsdef) {
        return Promise.resolve(tsdef);
    } else {
        // console.error('can not found task config builder method in module {0}.', mdl);
        console.log(chalk.yellow('can not found task define in module.'));
        return Promise.resolve(null);
    }
}
exports.findTaskDefineInModule = findTaskDefineInModule;
/**
 * fund tasks in module.
 *
 * @export
 * @param {(string | Object)} md
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
function findTasksInModule(md, match, ctx) {
    var mdls = void 0;
    try {
        if (_.isString(md)) {
            mdls = findTasks(require(md), match, ctx);
        } else {
            mdls = findTasks(md, match, ctx);
        }
    } catch (err) {
        return Promise.reject(err);
    }
    return Promise.resolve(mdls);
}
exports.findTasksInModule = findTasksInModule;
/**
 * find one task define in directories.
 *
 * @export
 * @param {Src} dirs
 * @returns {Promise<IContextDefine>}
 */
function findTaskDefineInDir(dirs) {
    return Promise.race(_.map(_.isArray(dirs) ? dirs : [dirs], function (dir) {
        return new Promise(function (resolve, reject) {
            if (fs_1.existsSync(dir)) {
                var mdl = requireDir(dir, { duplicates: true, camelcase: true, recurse: true });
                if (mdl) {
                    var def = findTaskDefine(mdl);
                    if (def) {
                        resolve(def);
                    }
                }
            }
        });
    }));
}
exports.findTaskDefineInDir = findTaskDefineInDir;
/**
 * find tasks in directories.
 *
 * @export
 * @param {Src} dirs
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
function findTasksInDir(dirs, match, ctx) {
    var map = new Map();
    return Promise.all(_.map(_.isArray(dirs) ? dirs : [dirs], function (dir) {
        console.log(chalk.grey('begin load task from dir'), chalk.cyan(dir));
        try {
            var mdl = requireDir(dir, { duplicates: true, camelcase: true, recurse: true });
            return Promise.resolve(findTaskMap(mdl, match, ctx, map));
        } catch (err) {
            return Promise.reject(err);
        }
    })).then(function (tasks) {
        return _.flatten(tasks);
    });
}
exports.findTasksInDir = findTasksInDir;
/**
 * task define context convert.
 *
 * @export
 * @param {ITaskDefine} tdef
 * @returns {IContextDefine}
 */
function taskDefine2Context(tdef) {
    var context = _.extend({}, tdef);
    context['getContext'] = function (cfg) {
        return bindingConfig_1.bindingConfig(tdef.loadConfig(cfg.option, cfg.env));
    };
    context['tasks'] = tdef.loadTasks ? function (context) {
        return tdef.loadTasks(context);
    } : null;
    return context;
}
exports.taskDefine2Context = taskDefine2Context;
//# sourceMappingURL=sourcemaps/decorator.js.map
