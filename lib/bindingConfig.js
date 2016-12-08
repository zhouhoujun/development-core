"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var TaskConfig_1 = require('./TaskConfig');
var generateTask_1 = require('./generateTask');
var taskSequence_1 = require('./taskSequence');
var utils_1 = require('./utils');
var decorator_1 = require('./decorator');
var path = require('path');
var fs = require('fs');
var globby = require('globby');
/**
 * binding Config, create task context.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @param {ITaskContext} [parent]
 * @returns {ITaskContext}
 */
function bindingConfig(cfg, parent) {
    if (cfg.createContext) {
        return cfg.createContext(cfg, parent);
    }
    return new TaskContext(cfg, parent);
}
exports.bindingConfig = bindingConfig;
/**
 * global data.
 */
var globals = {};
/**
 * TaskContext
 *
 * @export
 * @class TaskContext
 * @implements {ITaskContext}
 */

var TaskContext = function () {
    function TaskContext(cfg, parent) {
        _classCallCheck(this, TaskContext);

        this.cfg = cfg;
        this.parent = parent;
        this.setupTasks = [];
        this.packages = {};
        this.env = cfg.env;
        this.oper = currentOperation(cfg.env);
        this.option = cfg.option;
        this.globals = cfg.globals || globals;
    }

    _createClass(TaskContext, [{
        key: 'matchCompare',
        value: function matchCompare(task, match) {
            if (this.option.match) {
                return this.option.match(task, match);
            }
            return utils_1.matchCompare(task, match);
        }
    }, {
        key: 'getSrc',
        value: function getSrc(task) {
            var relative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var src = void 0;
            var ctx = this;
            var oper = task ? task.oper || ctx.oper : ctx.oper;
            if (task && task.assert) {
                src = taskSourceVal(getAssertSrc(task.assert, oper), ctx);
            }
            if (!src) {
                src = taskSourceVal(getAssertSrc(ctx.option, oper), ctx);
            }
            return relative !== false ? src : utils_1.absoluteSrc(ctx.env.root, src);
        }
    }, {
        key: 'getDist',
        value: function getDist(task) {
            var relative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var dist = void 0;
            var ctx = this;
            // let oper = task ? (task.oper || context.oper) : context.oper;
            if (task && task.assert) {
                dist = getCurrentDist(task.assert, ctx);
            }
            dist = dist || getCurrentDist(ctx.option, ctx);
            return relative !== false ? dist : utils_1.absolutePath(ctx.env.root, dist);
        }
    }, {
        key: 'subTaskName',
        value: function subTaskName(task) {
            var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            var ctx = this;
            var name = '';
            // let oper = context.oper;
            if (_.isString(task)) {
                name = task;
            } else if (task && task !== ctx.option) {
                // oper = task.oper || context.oper;
                if (task.name) {
                    name = taskStringVal(task.name, ctx);
                }
                if (!name && task.assert && task.assert.name) {
                    name = taskStringVal(task.assert.name, ctx);
                }
            }
            var optName = taskStringVal(ctx.option.name, ctx);
            if (optName) {
                if (name.indexOf(optName + '-') === 0) {
                    return name;
                }
                // avoid soma name.
                if (name && optName !== name) {
                    return optName + '-' + name + ext;
                }
                return optName + ext;
            } else {
                return name + ext;
            }
        }
    }, {
        key: 'printHelp',
        value: function printHelp(lang) {
            if (this.cfg.printHelp) {
                this.cfg.printHelp(lang);
            }
        }
    }, {
        key: 'findTasks',
        value: function findTasks(module, match) {
            var ctx = this;
            return decorator_1.findTasksInModule(module, _.extend({ oper: ctx.oper }, match || {}), this);
        }
    }, {
        key: 'findTasksInDir',
        value: function findTasksInDir(dirs, match) {
            var ctx = this;
            return decorator_1.findTasksInDir(dirs, _.extend({ oper: ctx.oper }, match || {}), this);
        }
    }, {
        key: 'findTaskDefine',
        value: function findTaskDefine(module) {
            return decorator_1.findTaskDefineInModule(module);
        }
    }, {
        key: 'findTaskDefineInDir',
        value: function findTaskDefineInDir(dirs) {
            return decorator_1.findTaskDefineInDir(dirs);
        }
    }, {
        key: 'fileFilter',
        value: function fileFilter(express, filter, mapping) {
            return files(express, filter, mapping);
        }
    }, {
        key: 'runSequence',
        value: function runSequence(gulp, tasks) {
            return taskSequence_1.runSequence(gulp, tasks);
        }
    }, {
        key: 'generateTask',
        value: function generateTask(tasks, match) {
            var ctx = this;
            return generateTask_1.generateTask(tasks, _.extend({ oper: ctx.oper }, match || {}), this);
        }
    }, {
        key: 'addToSequence',
        value: function addToSequence(sequence, task) {
            if (this.cfg.addToSequence) {
                return this.cfg.addToSequence(sequence, task);
            }
            return taskSequence_1.addToSequence(sequence, task, this);
        }
    }, {
        key: 'getRootPath',
        value: function getRootPath() {
            return this.env.root;
        }
    }, {
        key: 'getRootFolders',
        value: function getRootFolders(express) {
            return this.getFolders(this.getRootPath(), express);
        }
    }, {
        key: 'getFolders',
        value: function getFolders(pathstr, express) {
            var _this = this;

            var dir = fs.readdirSync(pathstr);
            var folders = [];
            _.each(dir, function (d) {
                var sf = path.join(pathstr, d);
                var f = fs.lstatSync(sf);
                if (f.isDirectory()) {
                    if (express) {
                        var fl = express(sf, d, _this);
                        if (fl) {
                            folders.push(fl);
                        }
                    } else {
                        folders.push(sf);
                    }
                }
            });
            return folders;
        }
    }, {
        key: 'getDistFolders',
        value: function getDistFolders(express, task) {
            return this.getFolders(this.getDist(task), express);
        }
    }, {
        key: 'toRootSrc',
        value: function toRootSrc(src) {
            return utils_1.absoluteSrc(this.cfg.env.root, src);
        }
    }, {
        key: 'toRootPath',
        value: function toRootPath(pathstr) {
            return utils_1.absolutePath(this.cfg.env.root, pathstr);
        }
    }, {
        key: 'toDistSrc',
        value: function toDistSrc(src, task) {
            return utils_1.absoluteSrc(this.getDist(task), src);
        }
    }, {
        key: 'toDistPath',
        value: function toDistPath(pathstr, task) {
            return utils_1.absolutePath(this.getDist(task), pathstr);
        }
    }, {
        key: 'toSrc',
        value: function toSrc(source) {
            return taskSourceVal(source, this);
        }
    }, {
        key: 'toStr',
        value: function toStr(name) {
            return taskStringVal(name, this);
        }
    }, {
        key: 'toUrl',
        value: function toUrl(basePath, toPath) {
            return (toPath ? path.relative(basePath, toPath) : basePath).replace(/\\/g, '/').replace(/^\//g, '');
        }
    }, {
        key: 'getPackage',
        value: function getPackage(filename) {
            filename = filename || this.cfg.packageFile;
            var name = this.toRootPath(this.toStr(filename) || 'package.json');
            if (!this.packages[name]) {
                this.packages[name] = require(name);
            }
            return this.packages[name];
        }
    }, {
        key: 'setup',
        value: function setup(task, gulp) {
            var rs = task.setup(this, gulp);
            this.setupTasks.push(task);
            return rs;
        }
    }, {
        key: 'tasks',
        value: function tasks(express) {
            return express ? _.filter(this.setupTasks, express) : this.setupTasks;
        }
    }, {
        key: 'registerTasks',
        value: function registerTasks(express) {
            return this.tasks(express);
        }
    }, {
        key: 'globalTasks',
        value: function globalTasks() {
            return _.keys(this.globals.tasks || {});
        }
    }]);

    return TaskContext;
}();

exports.TaskContext = TaskContext;
/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
function currentOperation(env) {
    var oper = void 0;
    if (env.deploy) {
        oper = TaskConfig_1.Operation.deploy;
    } else if (env.release) {
        oper = TaskConfig_1.Operation.release;
    } else {
        oper = TaskConfig_1.Operation.build;
    }
    if (env.watch) {
        oper = oper | TaskConfig_1.Operation.watch;
    }
    if (env.test) {
        oper = oper | TaskConfig_1.Operation.test;
    }
    if (env.serve) {
        oper = oper | TaskConfig_1.Operation.serve;
    }
    if (env.e2e) {
        oper = oper | TaskConfig_1.Operation.e2e;
    }
    return oper;
}
exports.currentOperation = currentOperation;
/**
 * get assert source.
 *
 * @param {IAssertDist} assert
 * @param {Operation} oper
 * @returns
 */
function getAssertSrc(assert, oper) {
    var src = null;
    if ((oper & TaskConfig_1.Operation.test) > 0) {
        src = assert.testSrc;
    } else if ((oper & TaskConfig_1.Operation.e2e) > 0) {
        src = assert.e2eSrc;
    } else if ((oper & TaskConfig_1.Operation.watch) > 0) {
        src = assert.watchSrc;
    } else if ((oper & TaskConfig_1.Operation.clean) > 0) {
        src = assert.cleanSrc || assert.dist;
    }
    return src || assert.src;
}
/**
 * get dist.
 *
 * @param {IAssertDist} ds
 * @param {ITaskContext} ctx
 * @returns
 */
function getCurrentDist(ds, ctx) {
    var dist = void 0;
    var env = ctx.env;
    var oper = ctx.oper;
    if (env.deploy || (oper & TaskConfig_1.Operation.deploy) > 0) {
        dist = ds.deployDist || taskStringVal(ds.dist, ctx);
    } else if (env.release || (oper & TaskConfig_1.Operation.release) > 0) {
        dist = ds.releaseDist || taskStringVal(ds.dist, ctx);
    } else if (env.e2e || (oper & TaskConfig_1.Operation.e2e) > 0) {
        dist = ds.e2eDist || ds.buildDist || taskStringVal(ds.dist, ctx);
    } else if (env.test || (oper & TaskConfig_1.Operation.test) > 0) {
        dist = ds.testDist || ds.buildDist || taskStringVal(ds.dist, ctx);
    } else if ((oper & TaskConfig_1.Operation.build) > 0) {
        dist = ds.buildDist || taskStringVal(ds.dist, ctx);
    }
    return dist;
}
/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
function files(express, filter, mapping) {
    return Promise.resolve(globby(express)).then(function (files) {
        if (filter) {
            files = _.filter(files, filter);
        }
        if (mapping) {
            files = _.map(files, mapping);
        }
        return files;
    });
}
exports.files = files;
/**
 * task src, string or array string.
 *
 * @export
 * @param {TaskSource} src
 * @param {Operation} oper runtime Operation
 * @param {IEnvOption} [env]
 * @returns
 */
function taskSourceVal(src, ctx) {
    return _.isFunction(src) ? src(ctx) : src || '';
}
exports.taskSourceVal = taskSourceVal;
/**
 * task string.
 *
 * @export
 * @param {TaskString} name
 * @param {ITaskContext} ctx
 * @returns
 */
function taskStringVal(name, ctx) {
    return _.isFunction(name) ? name(ctx) : name || '';
}
exports.taskStringVal = taskStringVal;
//# sourceMappingURL=sourcemaps/bindingConfig.js.map
