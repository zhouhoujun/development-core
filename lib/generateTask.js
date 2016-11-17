"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var coregulp = require('gulp');
var chalk = require('chalk');
var TaskConfig_1 = require('./TaskConfig');
var utils_1 = require('./utils');
var PipeTask_1 = require('./PipeTask');
/**
 * custom dynamic task.
 *
 * @class DynamicTask
 * @implements {ITask}
 */

var DynamicTask = function () {
    function DynamicTask(info, factory) {
        _classCallCheck(this, DynamicTask);

        this.info = info;
        this.factory = factory;
    }
    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */


    _createClass(DynamicTask, [{
        key: 'getInfo',
        value: function getInfo() {
            return this.info;
        }
    }, {
        key: 'setup',
        value: function setup(config, gulp) {
            var name = this.factory(config, gulp || coregulp);
            if (name) {
                this.info.taskName = name;
            }
            return name;
        }
    }]);

    return DynamicTask;
}();
/**
 * pipe task for dynamic task.
 *
 * @class DynamicPipeTask
 * @extends {PipeTask}
 */


var DynamicPipeTask = function (_PipeTask_1$PipeTask) {
    _inherits(DynamicPipeTask, _PipeTask_1$PipeTask);

    function DynamicPipeTask(dt, info) {
        _classCallCheck(this, DynamicPipeTask);

        var _this = _possibleConstructorReturn(this, (DynamicPipeTask.__proto__ || Object.getPrototypeOf(DynamicPipeTask)).call(this, info || dt));

        _this.dt = dt;
        _this.info.assert = dt;
        return _this;
    }

    _createClass(DynamicPipeTask, [{
        key: 'getOption',
        value: function getOption(ctx) {
            this.name = this.name || utils_1.taskStringVal(this.dt.name, ctx.oper, ctx.env);
            return this.dt || ctx.option;
        }
    }, {
        key: 'customPipe',
        value: function customPipe(source, ctx, dist, gulp) {
            var _this2 = this;

            if (this.dt.pipe) {
                return Promise.resolve(_get(DynamicPipeTask.prototype.__proto__ || Object.getPrototypeOf(DynamicPipeTask.prototype), 'customPipe', this).call(this, source, ctx, dist, gulp)).then(function (stream) {
                    return _this2.cpipe2Promise(stream, _this2.dt, ctx, dist, gulp);
                });
            } else {
                return _get(DynamicPipeTask.prototype.__proto__ || Object.getPrototypeOf(DynamicPipeTask.prototype), 'customPipe', this).call(this, source, ctx, dist, gulp);
            }
        }
    }, {
        key: 'pipes',
        value: function pipes(ctx, dist, gulp) {
            var pipes = _.isFunction(this.dt.pipes) ? this.dt.pipes(ctx, dist, gulp) : this.dt.pipes;
            pipes = pipes || [];
            return pipes.concat(_get(DynamicPipeTask.prototype.__proto__ || Object.getPrototypeOf(DynamicPipeTask.prototype), 'pipes', this).call(this, ctx, dist, gulp));
        }
    }, {
        key: 'output',
        value: function output(ctx, dist, gulp) {
            if (this.dt.output === null) {
                return [function (stream) {
                    return stream;
                }];
            }
            var outputs = _.isFunction(this.dt.output) ? this.dt.output(ctx, dist, gulp) : this.dt.output;
            outputs = outputs || [];
            return outputs.concat(_get(DynamicPipeTask.prototype.__proto__ || Object.getPrototypeOf(DynamicPipeTask.prototype), 'output', this).call(this, ctx, dist, gulp));
        }
    }]);

    return DynamicPipeTask;
}(PipeTask_1.PipeTask);
/**
 * dynamic build tasks.
 *
 * @export
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */


function generateTask(tasks, match) {
    var taskseq = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], function (dt) {
        if (dt.watchTasks) {
            dt.oper = (dt.oper || TaskConfig_1.Operation.default) | TaskConfig_1.Operation.watch;
        }
        if (!utils_1.matchTaskInfo(dt, match)) {
            return;
        }
        if (!utils_1.matchTaskGroup(dt, match)) {
            return;
        }
        taskseq.push(createTask(dt));
    });
    return taskseq;
}
exports.generateTask = generateTask;
/**
 * create task by dynamic option.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createTask(dt) {
    var task = void 0;
    if (dt.oper & TaskConfig_1.Operation.watch) {
        task = createWatchTask(dt);
    } else if (_.isFunction(dt.task)) {
        // custom task
        task = createCustomTask(dt);
    } else {
        // pipe stream task.
        task = createPipesTask(dt);
    }
    return task;
}
exports.createTask = createTask;
/**
 * create custom task.
 *
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createCustomTask(dt) {
    var factory = function factory(cfg, gulp) {
        var tk = cfg.subTaskName(dt);
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, function () {
            return dt.task(cfg, dt, gulp);
        });
        return tk;
    };
    return new DynamicTask({ order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, factory);
}
/**
 * create dynamic watch task.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createWatchTask(dt) {
    var factory = function factory(cfg, gulp) {
        var watchs = _.isFunction(dt.watchTasks) ? dt.watchTasks(cfg) : dt.watchTasks;
        if (!_.isFunction(_.last(watchs))) {
            watchs.push(function (event) {
                dt.watchChanged && dt.watchChanged(event, cfg);
            });
        }
        watchs = _.map(watchs, function (w) {
            if (_.isString(w)) {
                return cfg.subTaskName(w);
            }
            return w;
        });
        var tk = cfg.subTaskName(dt);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, function () {
            var src = cfg.getSrc(dt);
            console.log('watch, src:', chalk.cyan.call(chalk, src));
            gulp.watch(src, watchs);
        });
        return tk;
    };
    return new DynamicTask({ order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, factory);
}
/**
 * create pipe task.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createPipesTask(dt) {
    return new DynamicPipeTask(dt);
}
//# sourceMappingURL=sourcemaps/generateTask.js.map
