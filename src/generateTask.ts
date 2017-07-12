import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';

import { IAssertDist, IShellOption, IExecFileOption, IOutputPipe, Operation, AsyncSrc, ITaskInfo, ITransform, RunWay, AsyncTaskSource, TaskResult, IPipe, IDynamicTaskOption, ITaskContext, ITask } from './TaskConfig';
import { matchCompare } from './utils';
import { PipeTask } from './PipeTask';
import { runSequence } from './taskSequence';
import * as watch from 'gulp-watch';

type factory = (ctx: ITaskContext, info: ITaskInfo, gulp: Gulp) => TaskResult;

/**
 * Shell Task
 *
 * @class ShellTask
 * @implements {ITask}
 */
class ShellTask implements ITask {
    constructor(protected info: ITaskInfo, protected cmd: AsyncTaskSource) {

    }

    /**
     * get task info.
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    /**
     * setup shell task.
     *
     * @param {ITaskContext} ctx
     * @param {Gulp} [gulp]
     * @returns
     *
     * @memberOf ShellTask
     */
    setup(ctx: ITaskContext, gulp?: Gulp) {
        gulp = gulp || coregulp;
        let option = ctx.option as IShellOption;
        let tk = ctx.taskName(this.getInfo());
        console.log(`register shell task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            let cmd = ctx.to<AsyncSrc>(this.cmd);
            return Promise.resolve(cmd)
                .then(cmds => {
                    if (_.isString(cmds)) {
                        return ctx.execShell(cmds, option.execOptions);
                    } else if (_.isArray(cmds)) {
                        if (option.shellRunWay === RunWay.sequence) {
                            let pip = Promise.resolve();
                            _.each(cmds, cmd => {
                                pip = pip.then(() => ctx.execShell(cmd, option.execOptions));
                            });
                            return pip;
                        } else {
                            return Promise.all(_.map(cmds, cmd => ctx.execShell(cmd, option.execOptions)));
                        }
                    } else {

                        return Promise.reject('shell task config error');
                    }
                });

        });

        this.info.taskName = tk;

        return tk;
    }

}

/**
 * exec file Task
 *
 * @class ExecFileTask
 * @implements {ITask}
 */
class ExecFileTask implements ITask {
    constructor(protected info: ITaskInfo, protected files: AsyncTaskSource) {

    }

    /**
     * get task info.
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    /**
     * setup shell task.
     *
     * @param {ITaskContext} ctx
     * @param {Gulp} [gulp]
     * @returns
     *
     * @memberOf ShellTask
     */
    setup(ctx: ITaskContext, gulp?: Gulp) {
        gulp = gulp || coregulp;
        let option = ctx.option as IExecFileOption;
        let tk = ctx.taskName(this.getInfo());
        console.log(`register exec file task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            let files = ctx.to<AsyncSrc>(this.files);
            return Promise.resolve(files)
                .then(files => {
                    if (_.isString(files)) {
                        return ctx.execFile(files, option.args, option.execFileOptions);
                    } else if (_.isArray(files)) {
                        if (option.fileRunWay === RunWay.sequence) {
                            let pip = Promise.resolve();
                            _.each(files, file => {
                                pip = pip.then(() => ctx.execFile(file, option.args, option.execFileOptions));
                            });
                            return pip;
                        } else {
                            return Promise.all(_.map(files, file => ctx.execFile(file, option.args, option.execFileOptions)));
                        }
                    } else {
                        return Promise.reject('exec file task config error');
                    }
                });

        });

        this.info.taskName = tk;

        return tk;
    }

}

/**
 * custom dynamic task.
 *
 * @class DynamicTask
 * @implements {ITask}
 */
class DynamicTask implements ITask {
    constructor(protected info: ITaskInfo, private factory: factory) {
    }

    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    setup(ctx: ITaskContext, gulp?: Gulp) {
        let name = this.factory(ctx, this.getInfo(), gulp || coregulp);
        if (name) {
            this.info.taskName = name;
        }
        return name;
    }
}

/**
 * pipe task for dynamic task.
 *
 * @class DynamicPipeTask
 * @extends {PipeTask}
 */
class DynamicPipeTask extends PipeTask {
    constructor(private dt: IDynamicTaskOption, info?: ITaskInfo) {
        super(info || dt);
        this.info.assert = dt;
    }

    protected getOption(ctx: ITaskContext) {
        this.name = this.name || ctx.toStr(this.dt.name);
        return this.dt || ctx.option;
    }

    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        if (this.dt.pipe) {
            return Promise.resolve(super.customPipe(source, ctx, dist, gulp))
                .then(stream => this.cpipe2Promise(stream, this.dt, ctx, dist, gulp));
        } else {
            return super.customPipe(source, ctx, dist, gulp)
        }
    }

    pipes(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): IPipe[] {
        let pipes = _.isFunction(this.dt.pipes) ? this.dt.pipes(ctx, dist, gulp) : this.dt.pipes;
        pipes = pipes || [];
        return pipes.concat(super.pipes(ctx, dist, gulp));
    }

    output(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): IOutputPipe[] {
        if (this.dt.output === null) {
            return [stream => stream];
        }
        let outputs = _.isFunction(this.dt.output) ? this.dt.output(ctx, dist, gulp) : this.dt.output;
        outputs = outputs || [];
        return outputs.concat(super.output(ctx, dist, gulp));
    }

}

/**
 * dynamic build tasks.
 *
 * @export
 * @param {ITaskContext} ctx
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export function generateTask(ctx: ITaskContext, tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[] {
    let taskseq: ITask[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {
        dt.oper = dt.oper ? ctx.to(dt.oper) : Operation.default;
        if (dt.watchTasks) {
            dt.oper = dt.oper | Operation.watch;
        }

        if (!matchCompare(ctx, dt, match)) {
            return;
        }

        if (dt.watch && !(dt.oper & Operation.watch)) {
            dt.oper = dt.oper | Operation.autoWatch;
        }
        taskseq.push(createTask(ctx, dt));

    });

    return taskseq;
}

/**
 * create task by dynamic option.
 *
 * @param {ITaskContext} ctx
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createTask(ctx: ITaskContext, dt: IDynamicTaskOption): ITask {
    let task: ITask;
    if (ctx.to(dt.oper) & Operation.watch) {
        task = createWatchTask(dt);
    } else if (dt.shell) {
        task = new ShellTask(dt, dt.shell);
    } else if (dt.execFiles) {
        task = new ExecFileTask(dt, dt.execFiles);
    } else if (_.isFunction(dt.task)) {
        // custom task
        task = createCustomTask(dt);
    } else {
        // pipe stream task.
        task = createPipesTask(dt);
    }
    return task;
}


/**
 * create custom task.
 *
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createCustomTask(dt: IDynamicTaskOption): ITask {
    let factory = (ctx: ITaskContext, info: ITaskInfo, gulp: Gulp) => {
        let tk = ctx.taskName(info);
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            return dt.task(ctx, dt, gulp);
        });

        return tk
    };

    return new DynamicTask({ name: dt.name, order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, factory);
}


/**
 * create dynamic watch task.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createWatchTask(dt: IDynamicTaskOption): ITask {
    let factory = (ctx: ITaskContext, info: ITaskInfo, gulp: Gulp) => {
        let watchs = _.isFunction(dt.watchTasks) ? dt.watchTasks(ctx, dt) : dt.watchTasks;
        // if (!_.isFunction(_.last(watchs))) {
        //     watchs.push(<WatchCallback>(event: WatchEvent) => {
        //         dt.watchChanged && dt.watchChanged(event, ctx);
        //     });
        // }
        let callback;
        if (!_.isFunction(_.last(watchs))) {
            callback = (event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, ctx);
            };
        } else {
            callback = watchs.pop();
        }

        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return ctx.taskName(w);
            }
            return w;
        })
        let tk = ctx.taskName(info);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = ctx.getSrc(info);
            console.log('watch, src:', chalk.cyan.call(chalk, src));
            // watch(src, watchs);
            watch(src, () => {
                runSequence(gulp, <string[]>watchs)
                    .then(() => {
                        callback && callback();
                    });
            });
        });

        return tk;
    };

    return new DynamicTask({ name: dt.name, order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, factory);
}

/**
 * create pipe task.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createPipesTask(dt: IDynamicTaskOption): ITask {
    return new DynamicPipeTask(dt);
}
