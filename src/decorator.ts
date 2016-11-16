import 'reflect-metadata';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { ITask, ITaskDecorator, ITaskOption, ITaskConfig, IContextDefine, ITaskDefine, Src, IDynamicTasks } from './TaskConfig';
import { generateTask } from './generateTask';
import { bindingConfig } from './bindingConfig';
import { matchTaskGroup, matchTaskInfo } from './utils';
import { existsSync } from 'fs';
const requireDir = require('require-dir');


/**
 * task decorator.
 * 
 * @export
 * @param {ITaskDecorator} type
 * @returns
 */
export function task<T extends Function>(target?: (new <T>() => T) | ITaskDecorator): any {
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

/**
 * dynamic task decorator.
 * 
 * @export
 * @template T
 * @param {((new <T>() => T) | ITaskDecorator)} [target]
 * @returns {*}
 */
export function dynamicTask<T extends Function>(target?: (new <T>() => T) | ITaskDecorator): any {
    if (target && _.isFunction(target)) {
        target['__dynamictask'] = {};
        return target;
    } else {
        let tg = target;
        return (target: any) => {
            target['__dynamictask'] = tg || {};
            return target;
        }
    }
}

/**
 * find tasks in Object module.
 * 
 * @export
 * @param {*} target
 * @param {ITaskDecorator} [match]
 * @returns {ITask[]}
 */
export function findTasks(target: any, match?: ITaskDecorator): ITask[] {
    let tasks: ITask[] = [];
    if (!target) {
        return tasks;
    }
    if (_.isFunction(target)) {
        if (target['__task']) {
            let tinfo: ITaskDecorator = target['__task'];
            tinfo = _.isBoolean(tinfo) ? {} : tinfo;
            if (!matchTaskInfo(tinfo, match)) {
                return tasks;
            }

            if (!matchTaskGroup(tinfo, match)) {
                return tasks;
            }

            let task: ITask = new target(tinfo);
            if (task.setInfo) {
                task.setInfo(tinfo);
            }

            tasks.push(task);
        } else if (target['__dynamictask']) {
            let tinfo: ITaskDecorator = target['__dynamictask'];

            if (!matchTaskInfo(tinfo, match)) {
                return tasks;
            }

            if (!matchTaskGroup(tinfo, match)) {
                return tasks;
            }

            let dyts = _.map((<IDynamicTasks>new target()).tasks(), tk => {
                tk = _.extend(_.clone(tinfo), tk);
                // tk.group = tk.group || tinfo.group;
                return tk;
            });
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
 * decorator task define implements IContextDefine.
 * 
 * @export
 * @param {Function} constructor
 */
export function taskdefine<T extends Function>(target?: (new <T>() => T)): any {
    if (_.isFunction(target)) {
        target['__task_context'] = true;
        return target;
    } else {
        let tg = target;
        return (target: any) => {
            target['__task_context'] = tg || true;
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
export function findTaskDefines(target): IContextDefine[] {
    let defs: IContextDefine[] = [];
    if (!target) {
        return defs;
    }
    if (_.isFunction(target)) {
        if (target['__task_context']) {
            let dc = new target();
            if (!dc['getContext']) {
                dc = taskDefine2Context(dc);
            }
            defs.push(<IContextDefine>dc);
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
export function findTaskDefine(target): IContextDefine {
    let def: IContextDefine;
    if (!target) {
        return null;
    }
    if (_.isFunction(target)) {
        if (target['__task_context']) {
            let dc = new target();
            if (dc['getContext']) {
                def = dc;
            } else {
                def = taskDefine2Context(dc);
            }
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
 * @returns {Promise<IContextDefine>}
 */
export function findTaskDefineInModule(md: string | Object): Promise<IContextDefine> {
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

/**
 * fund tasks in module.
 * 
 * @export
 * @param {(string | Object)} md
 * @param {ITaskDecorator} [match]
 * @returns {Promise<ITask[]>}
 */
export function findTasksInModule(md: string | Object, match?: ITaskDecorator): Promise<ITask[]> {
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
 * @returns {Promise<IContextDefine>}
 */
export function findTaskDefineInDir(dirs: Src): Promise<IContextDefine> {
    return Promise.race<IContextDefine>(_.map(_.isArray(dirs) ? dirs : [dirs], dir => {
        return new Promise<IContextDefine>((resolve, reject) => {
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
 * @param {ITaskDecorator} [match]
 * @returns {Promise<ITask[]>}
 */
export function findTasksInDir(dirs: Src, match?: ITaskDecorator): Promise<ITask[]> {
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

/**
 * task define context convert.
 * 
 * @export
 * @param {ITaskDefine} tdef
 * @returns {IContextDefine}
 */
export function taskDefine2Context(tdef: ITaskDefine): IContextDefine {
    let context: any = _.extend({}, tdef);
    context['getContext'] = (cfg: ITaskConfig) => {
        return bindingConfig(tdef.loadConfig(<ITaskOption>cfg.option, cfg.env));
    };

    context['tasks'] = tdef.loadTasks ? (context) => tdef.loadTasks(context) : null;

    return <IContextDefine>context;
}
