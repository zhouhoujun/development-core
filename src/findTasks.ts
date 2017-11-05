import 'reflect-metadata';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { generateTask } from './generateTask';
// import { bindingConfig } from './bindingConfig';
import { matchCompare } from './utils/match';
import { existsSync } from 'fs';
import { ITask } from './ITask';
import { ITaskDecorator } from './ITaskDecorator';
import { IDynamicTasks } from './IDynamicTasks';
import { ITaskContext } from './ITaskContext';
import { ITaskDefine } from './ITaskDefine';
import { Src } from './types';
const requireDir = require('require-dir');


type Taskitem = ITask | ITask[];

function findTaskset(tasks: Map<any, Taskitem>, target: any, match?: ITaskDecorator, ctx?: ITaskContext) {

    if (!target) {
        return;
    }
    if (typeof(target) === 'function') { // _.isFunction(target)) {
        if (target['__task']) {
            let tinfo: ITaskDecorator = target['__task'];
            tinfo = _.isBoolean(tinfo) ? {} : tinfo;

            if (!matchCompare(ctx, tinfo, match)) {
                return;
            }
            if (tasks.has(target)) {
                return;
            }

            let task: ITask = new target(tinfo);
            if (task.setInfo) {
                task.setInfo(tinfo);
            }

            tasks.set(target, task);

        } else if (target['__dynamictask']) {
            let tinfo: ITaskDecorator = target['__dynamictask'];

            if (!matchCompare(ctx, tinfo, match)) {
                return;
            }

            if (tasks.has(target)) {
                return;
            }

            let dyts = _.map((<IDynamicTasks>new target()).tasks(), tk => {
                tk = _.extend(_.clone(tinfo), tk);
                // tk.group = tk.group || tinfo.group;
                return tk;
            });
            tasks.set(target, generateTask(ctx, dyts, match));
        }
    } else if (_.isArray(target)) {
        _.each(target, sm => {
            findTaskset(tasks, sm, match, ctx);
        });
    } else {
        _.each(_.keys(target), key => {
            if (!key || !target[key] || /^[0-9]+$/.test(key)) {
                return;
            }
            // console.log(chalk.grey('find task from :'), chalk.cyan(key));
            findTaskset(tasks, target[key], match, ctx);
        });
    }
}


function findTaskMap(target: any, match?: ITaskDecorator, ctx?: ITaskContext, map?: Map<any, Taskitem>): ITask[] {
    map = map || new Map<any, Taskitem>();
    findTaskset(map, target, match, ctx);
    let tasks: ITask[] = [];
    map.forEach((it: Taskitem) => {
        if (_.isArray(it)) {
            tasks.push(...it);
        } else {
            tasks.push(it);
        }
    });
    if (ctx) {
        ctx.addTask(...tasks);
    }
    return tasks;
}
/**
 * find tasks in Object module.
 *
 * @export
 * @param {*} target
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {ITask[]}
 */
export function findTasks(target: any, match?: ITaskDecorator, ctx?: ITaskContext): ITask[] {
    return findTaskMap(target, match, ctx);
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
    if (typeof(target) === 'function') {
        if (target['__task_context']) {
            let dc = new target();
            // if (!dc['getContext']) {
            //     dc = taskDefine2Context(dc);
            // }
            defs.push(<ITaskDefine>dc);
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
            // console.log(chalk.grey('find task define from :'), chalk.cyan(key));
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
    if (typeof(target) === 'function') {
        if (target['__task_context']) {
            def = new target();
            // if (dc['getContext']) {
            //     def = dc;
            // } else {
            //     def = taskDefine2Context(dc);
            // }
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
            // console.log(chalk.grey('find task define from :'), chalk.cyan(key));
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
        // console.log(chalk.yellow('can not found task define in module.'));
        return Promise.resolve(null);
    }
}

/**
 * fund tasks in module.
 *
 * @export
 * @param {(string | Object)} md
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
export function findTasksInModule(md: string | Object, match?: ITaskDecorator, ctx?: ITaskContext): Promise<ITask[]> {
    let mdls;
    try {
        if (_.isString(md)) {
            mdls = findTasks(require(md), match, ctx);
        } else {
            mdls = findTasks(md, match, ctx);
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
                let mdl = requireDir(dir, { duplicates: true, camelcase: true, recurse: true });
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
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
export function findTasksInDir(dirs: Src, match?: ITaskDecorator, ctx?: ITaskContext): Promise<ITask[]> {
    let map = new Map<any, Taskitem>();
    return Promise.all(_.map(_.isArray(dirs) ? dirs : [dirs], dir => {
        console.log(chalk.grey('begin load task from dir'), chalk.cyan(dir));
        try {
            let mdl = requireDir(dir, { duplicates: true, camelcase: true, recurse: true });
            return Promise.resolve(findTaskMap(mdl, match, ctx, map));
        } catch (err) {
            return Promise.reject(err);
        }
    }))
        .then(tasks => {
            return _.flatten(tasks);
        });
}
