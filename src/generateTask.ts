import * as _ from 'lodash';
import { matchCompare } from './utils/match';
import { DynamicTask } from './tasks/DynamicTask';
import { DynamicWatchTask } from './tasks/DynamicWatchTask';
import { DynamicPipeTask } from './tasks/DynamicPipeTask';
import { ShellTask } from './tasks/ShellTask';
import { ExecFileTask } from './tasks/ExecFileTask';
import { ITaskContext } from './ITaskContext';
import { IDynamicTaskOption } from './IDynamicTaskOption';
import { ITask, ITaskInfo } from './ITask';
import { Operation } from './Operation';



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
    return new DynamicTask({ name: dt.name, order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, dt);
}


/**
 * create dynamic watch task.
 *
 * @export
 * @param {IDynamicTaskOption} dt
 * @returns {ITask}
 */
function createWatchTask(dt: IDynamicTaskOption): ITask {
    return new DynamicWatchTask({ name: dt.name, order: dt.order, oper: dt.oper, group: dt.group, assert: dt }, dt);
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
