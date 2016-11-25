import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';

import { IAssertDist, IOutputPipe, Operation, ITaskInfo, ITransform, TaskResult, IPipe, IDynamicTaskOption, ITaskContext, ITask } from './TaskConfig';
import { matchCompare } from './utils';
import { PipeTask } from './PipeTask';

type factory = (ctx: ITaskContext, info: ITaskInfo, gulp: Gulp) => TaskResult;
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
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @param {ITaskContext} [ctx]
 * @returns {ITask[]}
 */
export function generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo, ctx?: ITaskContext): ITask[] {
    let taskseq: ITask[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {

        if (dt.watchTasks) {
            dt.oper = (dt.oper || Operation.default) | Operation.watch;
        }

        if (!matchCompare(dt, match, ctx)) {
            return;
        }

        if (dt.watch && !(dt.oper & Operation.watch)) {
            dt.oper = dt.oper | Operation.autoWatch;
        }
        taskseq.push(createTask(dt));

    });

    return taskseq;
}

/**
 * create task by dynamic option.
 * 
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
export function createTask(dt: IDynamicTaskOption): ITask {
    let task: ITask;
    if (dt.oper & Operation.watch) {
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


/**
 * create custom task.
 * 
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createCustomTask(dt: IDynamicTaskOption): ITask {
    let factory = (ctx: ITaskContext, info: ITaskInfo, gulp: Gulp) => {
        let tk = ctx.subTaskName(info);
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
        if (!_.isFunction(_.last(watchs))) {
            watchs.push(<WatchCallback>(event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, ctx);
            });
        }
        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return ctx.subTaskName(w);
            }
            return w;
        })
        let tk = ctx.subTaskName(info);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = ctx.getSrc(info);
            console.log('watch, src:', chalk.cyan.call(chalk, src));
            gulp.watch(src, watchs)
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
