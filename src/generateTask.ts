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
    _.each(_.isArray(tasks) ? tasks : [tasks], dtp => {
        dtp.oper = dtp.oper ? ctx.to(dtp.oper) : Operation.default;
        if (dtp.watchTasks) {
            dtp.oper = dtp.oper | Operation.watch;
        }

        if (!matchCompare(ctx, dtp, match)) {
            return;
        }

        if (dtp.watch && !(dtp.oper & Operation.watch)) {
            dtp.oper = dtp.oper | Operation.autoWatch;
        }
        taskseq.push(createTask(ctx, dtp));

    });

    return taskseq;
}

/**
 * create task by dynamic option.
 *
 * @param {ITaskContext} ctx
 * @param {IDynamicTaskOption} dtp
 * @returns {ITask}
 */
function createTask(ctx: ITaskContext, dtp: IDynamicTaskOption): ITask {
    let task: ITask;
    if (ctx.to(dtp.oper) & Operation.watch) {
        task = createWatchTask(dtp);
    } else if (dtp.shell) {
        task = new ShellTask(dtp, dtp.shell);
    } else if (dtp.execFiles) {
        task = new ExecFileTask(dtp, dtp.execFiles);
    } else if (_.isFunction(dtp.task)) {
        // custom task
        task = createCustomTask(dtp);
    } else {
        // pipe stream task.
        task = createPipesTask(dtp);
    }
    return task;
}


/**
 * create custom task.
 *
 * @param {IDynamicTaskOption} dtp
 * @returns {ITask}
 */
function createCustomTask(dtp: IDynamicTaskOption): ITask {
    return new DynamicTask({ name: dtp.name, order: dtp.order, oper: dtp.oper, group: dtp.group, assert: dtp }, dtp);
}


/**
 * create dynamic watch task.
 *
 * @export
 * @param {IDynamicTaskOption} dtp
 * @returns {ITask}
 */
function createWatchTask(dtp: IDynamicTaskOption): ITask {
    return new DynamicWatchTask({ name: dtp.name, order: dtp.order, oper: dtp.oper, group: dtp.group, assert: dtp }, dtp);
}

/**
 * create pipe task.
 *
 * @export
 * @param {IDynamicTaskOption} dtp
 * @returns {ITask}
 */
function createPipesTask(dtp: IDynamicTaskOption): ITask {
    return new DynamicPipeTask(dtp);
}
