"use strict";

var _ = require('lodash');
var TaskConfig_1 = require('./TaskConfig');
var generateTask_1 = require('./generateTask');
var taskSequence_1 = require('./taskSequence');
var utils_1 = require('./utils');
var decorator_1 = require('./decorator');
/**
 * binding Config to implement default func.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @returns {ITaskContext}
 */
function bindingConfig(cfg) {
    var oper = currentOperation(cfg.env);
    var context = {
        oper: oper,
        env: cfg.env,
        globals: cfg.globals || {},
        option: cfg.option,
        runTasks: cfg.runTasks,
        fileFilter: utils_1.files,
        runSequence: taskSequence_1.runSequence,
        addToSequence: cfg.addToSequence || taskSequence_1.addToSequence,
        generateTask: function generateTask(tasks, match) {
            return generateTask_1.generateTask(tasks, _.extend(createDefaultMatch(context), match || {}));
        },
        findTasks: function findTasks(mdl, match) {
            return decorator_1.findTasksInModule(mdl, _.extend(createDefaultMatch(context), match || {}));
        },
        findTasksInDir: function findTasksInDir(dirs, match) {
            return decorator_1.findTasksInDir(dirs, _.extend(createDefaultMatch(context), match || {}));
        },

        findTaskDefine: decorator_1.findTaskDefineInModule.bind(this),
        findTaskDefineInDir: decorator_1.findTaskDefineInDir.bind(this),
        subTaskName: function subTaskName(task) {
            var deft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            var name = '';
            // let oper = context.oper;
            if (_.isString(task)) {
                name = task;
            } else if (task && task !== context.option) {
                // oper = task.oper || context.oper;
                var n = task.name;
                if (!n) {
                    n = task.assert ? task.assert.name : '';
                }
                name = utils_1.taskStringVal(n, context.oper, cfg.env);
            } else {
                name = deft;
            }
            var parentName = utils_1.taskStringVal(cfg.option.name, context.oper, cfg.env);
            return parentName ? parentName + '-' + name : name;
        },
        getSrc: function getSrc(task) {
            var relative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var src = void 0;
            var oper = task ? task.oper || context.oper : context.oper;
            if (task && task.assert) {
                src = utils_1.taskSourceVal(getAssertSrc(task.assert, oper), context.oper, cfg.env);
            }
            if (!src) {
                src = utils_1.taskSourceVal(getAssertSrc(cfg.option, oper), context.oper, cfg.env);
            }
            return relative !== false ? src : utils_1.absoluteSrc(cfg.env.root, src);
        },
        getDist: function getDist(task) {
            var relative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var dist = void 0;
            // let oper = task ? (task.oper || context.oper) : context.oper;
            if (task && task.assert) {
                dist = getCurrentDist(task.assert, context.oper, cfg.env);
            }
            dist = dist || getCurrentDist(context.option, context.oper, cfg.env);
            return relative !== false ? dist : utils_1.absolutePath(cfg.env.root, dist);
        },
        toRootSrc: function toRootSrc(src) {
            return utils_1.absoluteSrc(cfg.env.root, src);
        },
        toRootPath: function toRootPath(pathstr) {
            return utils_1.absolutePath(cfg.env.root, pathstr);
        }
    };
    return context;
}
exports.bindingConfig = bindingConfig;
var createDefaultMatch = function createDefaultMatch(ctx) {
    var match = { oper: ctx.oper };
    if (ctx.match) {
        match.match = function (anothor) {
            return ctx.match(match, anothor);
        };
    }
    return match;
};
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
 * @param {OutputDist} ds
 * @param {Operation} oper runtime Operation.
 * @returns
 */
function getCurrentDist(ds, oper, env) {
    var dist = void 0;
    if (env.deploy || (oper & TaskConfig_1.Operation.deploy) > 0) {
        dist = ds.deployDist || utils_1.taskStringVal(ds.dist, oper, env);
    } else if (env.release || (oper & TaskConfig_1.Operation.release) > 0) {
        dist = ds.releaseDist || utils_1.taskStringVal(ds.dist, oper, env);
    } else if (env.e2e || (oper & TaskConfig_1.Operation.e2e) > 0) {
        dist = ds.e2eDist || ds.buildDist || utils_1.taskStringVal(ds.dist, oper, env);
    } else if (env.test || (oper & TaskConfig_1.Operation.test) > 0) {
        dist = ds.testDist || ds.buildDist || utils_1.taskStringVal(ds.dist, oper, env);
    } else if ((oper & TaskConfig_1.Operation.build) > 0) {
        dist = ds.buildDist || utils_1.taskStringVal(ds.dist, oper, env);
    }
    return dist;
}
//# sourceMappingURL=sourcemaps/bindingConfig.js.map
