import * as _ from 'lodash';
import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';

import { IAssertDist, IOutputPipe, Operation, ITaskInfo, ITransform, TaskResult, IPipe, IDynamicTaskOption, ITaskContext, ITask } from './TaskConfig';
import { matchTaskGroup, matchTaskInfo, taskStringVal } from './utils';
import { PipeTask } from './PipeTask';

type factory = (config: ITaskContext, gulp: Gulp) => TaskResult;
class DynamicTask implements ITask {
    constructor(public decorator: ITaskInfo, private factory: factory) {
    }
    setup(config: ITaskContext, gulp?: Gulp) {
        let name = this.factory(config, gulp || coregulp);
        if (name) {
            this.decorator.taskName = name;
        }
        return name;
    }
}

class DynamicPipeTask extends PipeTask {
    constructor(private dt: IDynamicTaskOption, info?: ITaskInfo) {
        super(info);
        this.decorator = info || dt;
        this.decorator.assert = dt;
    }

    protected getOption(config: ITaskContext) {
        this.name = this.name || taskStringVal(this.dt.name, config.oper);
        return this.dt || config.option;
    }

    protected customPipe(source: ITransform, config: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        if (this.dt.pipe) {
            return Promise.resolve(super.customPipe(source, config, dist, gulp))
                .then(stream => this.cpipe2Promise(stream, this.dt, config, dist, gulp));
        } else {
            return super.customPipe(source, config, dist, gulp)
        }
    }

    pipes(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): IPipe[] {
        let pipes = _.isFunction(this.dt.pipes) ? this.dt.pipes(config, dist, gulp) : this.dt.pipes;
        pipes = pipes || [];
        return pipes.concat(super.pipes(config, dist, gulp));
    }

    output(config: ITaskContext, dist: IAssertDist, gulp?: Gulp): IOutputPipe[] {
        if (this.dt.output === null) {
            return [stream => stream];
        }
        let outputs = _.isFunction(this.dt.output) ? this.dt.output(config, dist, gulp) : this.dt.output;
        outputs = outputs || [];
        return outputs.concat(super.output(config, dist, gulp));
    }

}

/**
 * dynamic build tasks.
 * 
 * @export
 * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export function generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[] {
    let taskseq: ITask[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {

        if (dt.watchTasks) {
            dt.oper = (dt.oper || Operation.default) | Operation.watch;
        }
        if (!matchTaskInfo(dt, match)) {
            return;
        }

        if (!matchTaskGroup(dt, match)) {
            return;
        }

        if ((dt.oper & Operation.watch) > 0) {
            taskseq.push(createWatchTask(dt))
        } else if (_.isFunction(dt.task)) {
            // custom task
            taskseq.push(createTask(dt));
        } else {
            // pipe stream task.
            taskseq.push(createPipesTask(dt));
        }
    });

    return taskseq;
}



/**
 * promise task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createTask(dt: IDynamicTaskOption) {
    let factory = (cfg: ITaskContext, gulp: Gulp) => {
        let tk = cfg.subTaskName(dt.name);
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            return dt.task(cfg, dt, gulp);
        });

        return tk
    };

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: dt.watch, group: dt.group, assert: dt }, factory);
}
/**
 * create dynamic watch task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createWatchTask(dt: IDynamicTaskOption) {
    let factory = (cfg: ITaskContext, gulp: Gulp) => {
        let watchs = _.isFunction(dt.watchTasks) ? dt.watchTasks(cfg) : dt.watchTasks;
        if (!_.isFunction(_.last(watchs))) {
            watchs.push(<WatchCallback>(event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, cfg);
            });
        }
        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return cfg.subTaskName(w);
            }
            return w;
        })
        let tk = cfg.subTaskName(dt);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = cfg.getSrc(dt);
            console.log('watch, src:', chalk.cyan.call(chalk, src));
            gulp.watch(src, watchs)
        });

        return tk;
    };

    return new DynamicTask({ order: dt.order, oper: dt.oper, watch: dt.watch, group: dt.group, assert: dt }, factory);
}

function createPipesTask(dt: IDynamicTaskOption) {
    return new DynamicPipeTask(dt);
}
