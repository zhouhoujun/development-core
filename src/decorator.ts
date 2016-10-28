import 'reflect-metadata';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { ITask, ITaskInfo, ITaskDefine } from './TaskConfig';



/**
 * task decorator.
 * 
 * @export
 * @param {ITaskInfo} type
 * @returns
 */
export function task(option?: ITaskInfo) {
    return (target: any) => {
        target['__task'] = option || {};
        return target;
    }
}

export function findTasks(target: any): ITask[] {
    let tasks: ITask[] = [];
    if (!target) {
        return tasks;
    }
    if (_.isFunction(target)) {
        if (target['__task']) {
            let task: ITask = new target();
            task.decorator = <ITaskInfo>target['__task'];
            tasks.push(task);
        }
    } else if (_.isArray(target)) {
        _.each(target, sm => {
            tasks.concat(findTasks(sm));
        });
    } else {
        _.each(_.keys(target), key => {
            if (target[key]) {
                console.log(chalk.grey('find task from :'), chalk.cyan(key));
                tasks = tasks.concat(findTasks(target[key]));
            }
        });
    }

    return tasks;
}

/**
 * decorator task define implements ITaskDefine.
 * 
 * @export
 * @param {Function} constructor
 */
export function taskdefine() {
    return (target: any) => {
        target['__taskdefine'] = true;
        return target;
    }
}

/**
 * get taskdefine in module.
 * 
 * @export
 * @param {any} target
 * @returns
 */
export function findTaskDefine(target): ITaskDefine[] {
    let defs: ITaskDefine[] = [];
    if (!target) {
        return defs;
    }
    if (_.isFunction(target)) {
        if (target['__taskdefine']) {
            defs.push(<ITaskDefine>new target());
        }
    } else if (_.isArray(target)) {
        _.each(target, sm => {
            defs.concat(findTaskDefine(sm));
        });
    } else {
        _.each(_.keys(target), key => {
            console.log(chalk.grey('find task define from :'), chalk.cyan(key));
            if (target[key]) {
                defs = defs.concat(findTaskDefine(target[key]));
            }
        });
    }

    return defs;
}
