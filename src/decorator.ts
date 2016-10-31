import 'reflect-metadata';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { ITask, ITaskInfo, ITaskDefine, Src, IDynamicTasks, Operation, IEnvOption } from './TaskConfig';
import { generateTask } from './generateTask';
import { existsSync } from 'fs';
const requireDir = require('require-dir');


/**
 * task decorator.
 * 
 * @export
 * @param {ITaskInfo} type
 * @returns
 */
export function task<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any {
    if (_.isFunction(target)) {
        target['__task'] = {};
        return target;
    } else {
        let tg = target;
        return (target: any) => {
            target['__task'] = tg || {};
            return target;
        }
    }
}

export function dynamicTask<T extends Function>(target?: (new <T>() => T) | ITaskInfo): any {
    if (target && _.isFunction(target)) {
        target['__dynamictask'] = true;
        return target;
    } else {
        let tg = target;
        return (target: any) => {
            target['__dynamictask'] = tg || true;
            return target;
        }
    }
}



/**
 * find tasks in Object module.
 * 
 * @export
 * @param {*} target
 * @param {ITaskInfo} [match]
 * @returns {ITask[]}
 */
export function findTasks(target: any, match?: ITaskInfo): ITask[] {
    let tasks: ITask[] = [];
    if (!target) {
        return tasks;
    }
    if (_.isFunction(target)) {
        if (target['__task']) {
            let tinfo: ITaskInfo = target['__task'];

            if (match) {
                if (match.oper && tinfo.oper && (tinfo.oper & match.oper) <= 0) {
                    return tasks;
                }

                if (match.group && tinfo.group !== match.group) {
                    return tasks;
                }
            }

            if (tinfo.watch) {
                if (!match || !match.watch) {
                    return tasks;
                } else if (tinfo.watch !== match.watch) {
                    return tasks;
                }
            }


            let task: ITask = new target();
            task.decorator = tinfo;
            tasks.push(task);
        } else if (target['__dynamictask']) {
            let tinfo: ITaskInfo = target['__dynamictask'];
            if (match) {
                if (match.oper && tinfo.oper && (tinfo.oper & match.oper) <= 0) {
                    return tasks;
                }

                if (match.group && tinfo.group !== match.group) {
                    return tasks;
                }
            }

            if (tinfo.watch) {
                if (!match || !match.watch) {
                    return tasks;
                } else if (tinfo.watch !== match.watch) {
                    return tasks;
                }
            }

            let dyts = (<IDynamicTasks>new target()).tasks()
            tasks = tasks.concat(generateTask(dyts, match));
        }
    } else if (_.isArray(target)) {
        _.each(target, sm => {
            tasks.concat(findTasks(sm, match));
        });
    } else {
        _.each(_.keys(target), key => {
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return;
            }
            console.log(chalk.grey('find task from :'), chalk.cyan(key));
            tasks = tasks.concat(findTasks(target[key], match));
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
export function taskdefine<T extends Function>(target?: (new <T>() => T)): any {
    if (_.isFunction(target)) {
        target['__taskdefine'] = true;
        return target;
    } else {
        let tg = target;
        return (target: any) => {
            target['__taskdefine'] = tg || true;
            return target;
        }
    }
}

/**
 * get all taskdefine in module.
 * 
 * @export
 * @param {any} target
 * @returns
 */
export function findTaskDefines(target): ITaskDefine[] {
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
            defs.concat(findTaskDefines(sm));
        });
    } else {
        _.each(_.keys(target), key => {
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return;
            }
            console.log(chalk.grey('find task define from :'), chalk.cyan(key));
            defs = defs.concat(findTaskDefines(target[key]));
        });
    }

    return defs;
}


/**
 * get one taskdefine in module.
 * 
 * @export
 * @param {any} target
 * @returns
 */
export function findTaskDefine(target): ITaskDefine {
    let def: ITaskDefine;
    if (!target) {
        return null;
    }
    if (_.isFunction(target)) {
        if (target['__taskdefine']) {
            def = <ITaskDefine>new target();
        }
    } else if (_.isArray(target)) {
        _.each(target, sm => {
            if (def) {
                return false;
            }
            def = findTaskDefine(sm);
            return true;
        });
    } else {
        _.each(_.keys(target), key => {
            if (def) {
                return false;
            }
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return true;
            }
            console.log(chalk.grey('find task define from :'), chalk.cyan(key));
            def = findTaskDefine(target[key]);
            return true;
        });
    }

    return def;
}

/**
 * find one taskdefine in module.
 * 
 * @export
 * @param {(string | Object)} md
 * @returns {Promise<ITaskDefine>}
 */
export function findTaskDefineInModule(md: string | Object): Promise<ITaskDefine> {
    let tsdef;
    try {
        if (_.isString(md)) {
            tsdef = findTaskDefine(require(md));
        } else {
            tsdef = findTaskDefine(md);
        }
    } catch (err) {
        return Promise.reject(err);
    }

    if (tsdef) {
        return Promise.resolve(tsdef);
    } else {
        // console.error('can not found task config builder method in module {0}.', mdl);
        return Promise.reject('can not found task define.');
    }
}


export function findTasksInModule(md: string | Object, match?: ITaskInfo): Promise<ITask[]> {
    let mdls;
    try {
        if (_.isString(md)) {
            mdls = findTasks(require(md), match);
        } else {
            mdls = findTasks(md, match);
        }
    } catch (err) {
        return Promise.reject(err);
    }

    return Promise.resolve(mdls);
}


/**
 * find one task define in directories.
 * 
 * @export
 * @param {Src} dirs
 * @returns {Promise<ITaskDefine>}
 */
export function findTaskDefineInDir(dirs: Src): Promise<ITaskDefine> {
    return Promise.race<ITaskDefine>(_.map(_.isArray(dirs) ? dirs : [dirs], dir => {
        return new Promise<ITaskDefine>((resolve, reject) => {
            if (existsSync(dir)) {
                let mdl = requireDir(dir);
                if (mdl) {
                    let def = findTaskDefine(mdl);
                    if (def) {
                        resolve(def);
                    }
                }
            }
        });
    }));
}

/**
 * find tasks in directories.
 * 
 * @export
 * @param {Src} dirs
 * @param {ITaskInfo} [match]
 * @returns {Promise<ITask[]>}
 */
export function findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]> {
    return Promise.all(_.map(_.isArray(dirs) ? dirs : [dirs], dir => {
        console.log(chalk.grey('begin load task from dir'), chalk.cyan(dir));
        try {
            let mdl = requireDir(dir, { recurse: true });
            return Promise.resolve(findTasks(mdl, match));
        } catch (err) {
            return Promise.reject(err);
        }
    }))
        .then(tasks => {
            return _.flatten(tasks);
        });
}