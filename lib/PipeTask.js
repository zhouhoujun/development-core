"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaskConfig_1 = require('./TaskConfig');
var utils_1 = require('./utils');
var coregulp = require('gulp');
var chalk = require('chalk');
var _ = require('lodash');
/**
 * Task base class.
 *
 * @export
 * @class Task
 * @implements {ITask}
 */

var PipeTask = function () {
    function PipeTask(info) {
        _classCallCheck(this, PipeTask);

        /**
         * run mutil source stream way. default parallel.
         *
         *
         * @memberOf PipeTask
         */
        this.runWay = TaskConfig_1.RunWay.parallel;
        this.info = info || {};
        this.info.name = this.info.name || this.name;
    }
    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */


    _createClass(PipeTask, [{
        key: 'getInfo',
        value: function getInfo() {
            if (!this.info.name) {
                this.info.name = this.name;
            }
            return this.info;
        }
        /**
         * source streams.
         *
         * @param {ITaskContext} context
         * @param {IAssertDist} option
         * @param {Gulp} gulp
         * @returns {(TransformSource | Promise<TransformSource>)}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'source',
        value: function source(ctx, dist, gulp) {
            // let source: TransformSource | Promise<TransformSource> = null;
            // ctx.pipeOption((op) => {
            //     if (!source && op.source) {
            //         source = _.isFunction(op.source) ? op.source(ctx, dist, gulp) : op.source;
            //     }
            // });
            // if (source) {
            //     return source;
            // }
            // return gulp.src(ctx.getSrc(this.getInfo()));
            var option = ctx.option;
            if (option.source) {
                return _.isFunction(option.source) ? option.source(ctx, dist, gulp) : option.source;
            }
            var loader = option['loader'];
            if (loader && option.source) {
                return _.isFunction(loader.source) ? loader.source(ctx, dist, gulp) : loader.source;
            }
            return gulp.src(ctx.getSrc(this.getInfo()));
        }
        /**
         * task pipe works.
         *
         * @param {ITaskContext} context
         * @param {IAssertDist} dist
         * @param {Gulp} [gulp]
         * @returns {Pipe[]}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'pipes',
        value: function pipes(ctx, dist, gulp) {
            // let pipes: Pipe[] = [];
            // ctx.pipeOption((op) => {
            //     let opps = _.isFunction(op.pipes) ? op.pipes(ctx, dist, gulp) : _.filter(<Pipe[]>op.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            //     if (opps && opps.length > 0) {
            //         pipes = pipes.concat(opps)
            //     }
            // });
            // return pipes;
            var option = ctx.option;
            var pipes = null;
            var loader = option['loader'];
            if (loader && _.isFunction(loader.pipes)) {
                pipes = _.isFunction(loader.pipes) ? loader.pipes(ctx, option, gulp) : _.filter(loader.pipes, function (p) {
                    return _.isFunction(p) || p.name && p.name === dist.name;
                });
            }
            if (option.pipes) {
                var opps = _.isFunction(option.pipes) ? option.pipes(ctx, option, gulp) : _.filter(option.pipes, function (p) {
                    return _.isFunction(p) || p.name && p.name === dist.name;
                });
                if (opps && opps.length > 0) {
                    pipes = pipes ? pipes.concat(opps) : opps;
                }
            }
            return pipes || [];
        }
        /**
         * output pipes.
         *
         * @param {ITaskContext} context
         * @param {IAssertDist} dist
         * @param {Gulp} [gulp]
         * @returns {OutputPipe[]}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'output',
        value: function output(ctx, dist, gulp) {
            // let pipes: OutputPipe[] = [];
            // ctx.pipeOption((op) => {
            //     if (pipes === null) {
            //         return;
            //     }
            //     if (op.output === null) {
            //         pipes = null;
            //     } else {
            //         let outs = _.isFunction(op.output) ? op.output(ctx, dist, gulp) : _.filter(<OutputPipe[]>op.pipes, p => _.isFunction(p) || (p.name && p.name === dist.name));
            //         if (outs && outs.length > 0) {
            //             pipes = pipes.concat(outs);
            //         }
            //     }
            // });
            // if (pipes === null) {
            //     return [(stream) => stream];
            // }
            // if (pipes.length > 0) {
            //     return pipes;
            // }
            // return [(stream) => stream.pipe(gulp.dest(ctx.getDist(dist)))]
            var option = ctx.option;
            var pipes = null;
            var loader = option['loader'];
            if (loader && !_.isString(loader) && !_.isArray(loader)) {
                if (loader.output) {
                    pipes = _.isFunction(loader.output) ? loader.output(ctx, option, gulp) : _.filter(loader.pipes, function (p) {
                        return _.isFunction(p) || p.name && p.name === dist.name;
                    });
                } else if (loader.output === null) {
                    return [function (stream) {
                        return stream;
                    }];
                }
            }
            if (option.output) {
                var opps = _.isFunction(option.output) ? option.output(ctx, option, gulp) : _.filter(option.output, function (p) {
                    return _.isFunction(p) || p.name && p.name === dist.name;
                });
                if (opps && opps.length > 0) {
                    pipes = pipes ? pipes.concat(opps) : opps;
                }
            } else if (option.output === null) {
                return [function (stream) {
                    return stream;
                }];
            }
            return pipes || [function (stream) {
                return stream.pipe(gulp.dest(ctx.getDist(dist)));
            }];
        }
        /**
         *  custom pipe Promise.
         *
         * @protected
         * @param {ITransform} source
         * @param {ITaskContext} ctx
         * @param {IAssertDist} dist
         * @param {Gulp} gulp
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'customPipe',
        value: function customPipe(source, ctx, dist, gulp) {
            var _this = this;

            // let prsrc: Promise<ITransform> = null;
            // ctx.pipeOption((op) => {
            //     if (op.pipe) {
            //         prsrc = prsrc ? prsrc.then(stream => this.cpipe2Promise(stream, op, ctx, dist, gulp))
            //             : this.cpipe2Promise(source, op, ctx, dist, gulp);
            //     }
            // }, false);
            // return prsrc || source;
            var cfgopt = ctx.option;
            var loader = cfgopt['loader'];
            var prsrc = void 0;
            if (cfgopt.pipe) {
                prsrc = this.cpipe2Promise(source, cfgopt, ctx, dist, gulp);
            }
            if (loader && !_.isString(loader) && !_.isArray(loader) && loader.pipe) {
                prsrc = prsrc ? prsrc.then(function (stream) {
                    return _this.cpipe2Promise(stream, loader, ctx, dist, gulp);
                }) : this.cpipe2Promise(source, loader, ctx, dist, gulp);
            }
            return prsrc || source;
        }
        /**
         * get option.
         *
         * @protected
         * @param {ITaskContext} context
         * @returns {IAssertDist}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'getOption',
        value: function getOption(context) {
            return context.option;
        }
        /**
         * match pipe Operate
         *
         * @param {IPipeOperate} p
         * @param {string} name
         * @param {ITaskContext} context
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'match',
        value: function match(p, name, context) {
            if (!p) {
                return false;
            }
            if (p.name && !name.endsWith(utils_1.taskStringVal(p.name, context))) {
                return false;
            }
            if (p.oper && (p.oper & context.oper) <= 0) {
                return false;
            }
            return true;
        }
        /**
         * convert custom pipe result to Promise.
         *
         * @protected
         * @param {ITransform} source
         * @param {ICustomPipe} opt
         * @param {ITaskContext} context
         * @param {IAssertDist} dist
         * @param {Gulp} gulp
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'cpipe2Promise',
        value: function cpipe2Promise(source, opt, context, dist, gulp) {
            return new Promise(function (resolve, reject) {
                var ps = opt.pipe(source, context, dist, gulp, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
                if (ps) {
                    Promise.resolve(ps).then(resolve, reject);
                }
            });
        }
        /**
         * covert pipes transform to Promise.
         *
         * @protected
         * @param {ITransform} source
         * @param {ITaskContext} context
         * @param {IAssertDist} dist
         * @param {Gulp} gulp
         * @param {Pipe[]} [pipes]
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'pipes2Promise',
        value: function pipes2Promise(source, ctx, dist, gulp, pipes) {
            var _this2 = this;

            var name = ctx.subTaskName(dist, this.name);
            return Promise.all(_.map(pipes || this.pipes(ctx, dist, gulp), function (p) {
                if (_.isFunction(p)) {
                    return p(ctx, dist, gulp);
                } else {
                    if (!_this2.match(p, name, ctx)) {
                        return null;
                    } else {
                        return Promise.resolve(p.toTransform(ctx, dist, gulp)).then(function (trs) {
                            trs.order = p.order;
                            return trs;
                        });
                    }
                }
            })).then(function (tanseq) {
                var tans = utils_1.sortOrder(tanseq, function (it) {
                    return it.order;
                });
                _.each(tans, function (stream) {
                    if (!_this2.match(stream, name, ctx)) {
                        return;
                    }
                    if (_.isFunction(stream.transformSourcePipe)) {
                        source = stream.transformSourcePipe(source);
                    } else if (_.isFunction(source.transformPipe)) {
                        source = source.transformPipe(stream);
                    } else {
                        source = source.pipe(stream);
                    }
                });
                return source;
            });
        }
        /**
         * output pipes transform to Promise.
         *
         * @protected
         * @param {ITransform} source
         * @param {ITaskContext} context
         * @param {IAssertDist} dist
         * @param {Gulp} gulp
         * @param {OutputPipe[]} [output]
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'output2Promise',
        value: function output2Promise(source, context, dist, gulp, output) {
            var _this3 = this;

            var name = context.subTaskName(dist, this.name);
            var outputs = output || this.output(context, dist, gulp);
            return Promise.all(_.map(outputs, function (output) {
                if (_.isFunction(output)) {
                    return output(source, context, dist, gulp);
                } else {
                    if (!_this3.match(output, name, context)) {
                        return null;
                    } else {
                        return output.toTransform(source, context, dist, gulp);
                    }
                }
            })).then(function (outputs) {
                return Promise.all(_.map(outputs, function (output) {
                    return new Promise(function (resolve, reject) {
                        if (output) {
                            output.once('end', function () {
                                resolve(output);
                            }).once('error', reject);
                        } else {
                            resolve();
                        }
                    });
                }));
            });
        }
        /**
         * each one source stream works.
         *
         * @protected
         * @param {ITransform} source
         * @param {ITaskContext} ctx
         * @param {IAssertDist} option
         * @param {Gulp} gulp
         * @param {Pipe[]} [pipes]
         * @param {OutputPipe[]} [output]
         * @returns
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'working',
        value: function working(source, ctx, option, gulp, pipes, output) {
            var _this4 = this;

            return Promise.resolve(source).then(function (psrc) {
                return _this4.customPipe(psrc, ctx, option, gulp);
            }).then(function (psrc) {
                return _this4.pipes2Promise(psrc, ctx, option, gulp, pipes);
            }).then(function (psrc) {
                return _this4.output2Promise(psrc, ctx, option, gulp, output);
            }).catch(function (err) {
                console.log(chalk.red(err));
                process.exit(0);
            });
        }
        /**
         * execute task working
         *
         * @param {ITaskContext} context
         * @param {Gulp} gulp
         * @returns {Promise<any>}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'execute',
        value: function execute(context, gulp) {
            var _this5 = this;

            var option = this.getOption(context);
            return Promise.resolve(this.source(context, option, gulp)).then(function (stream) {
                if (_.isArray(stream)) {
                    if (_this5.runWay === TaskConfig_1.RunWay.parallel) {
                        return Promise.all(_.map(stream, function (st) {
                            return _this5.working(st, context, option, gulp);
                        }));
                    } else if (_this5.runWay === TaskConfig_1.RunWay.sequence) {
                        var _ret = function () {
                            var pthen = void 0;
                            _.each(stream, function (st) {
                                if (!pthen) {
                                    pthen = _this5.working(st, context, option, gulp);
                                } else {
                                    pthen = pthen.then(function () {
                                        return _this5.working(st, context, option, gulp);
                                    });
                                }
                            });
                            return {
                                v: pthen
                            };
                        }();

                        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                    } else {
                        return Promise.reject('runWay setting error.');
                    }
                } else {
                    return _this5.working(stream, context, option, gulp);
                }
            });
        }
        /**
         * setup task works.
         *
         * @param {ITaskContext} context
         * @param {Gulp} [gulp]
         * @returns {TaskResult}
         *
         * @memberOf PipeTask
         */

    }, {
        key: 'setup',
        value: function setup(context, gulp) {
            var _this6 = this;

            gulp = gulp || coregulp;
            // let option = this.getOption(context);
            var tk = context.subTaskName(this.getInfo());
            console.log('register ' + (this.name || '') + ' task:', chalk.cyan(tk));
            gulp.task(tk, function () {
                return _this6.execute(context, gulp);
            });
            this.info.taskName = tk;
            return tk;
        }
    }]);

    return PipeTask;
}();

exports.PipeTask = PipeTask;
//# sourceMappingURL=sourcemaps/PipeTask.js.map
