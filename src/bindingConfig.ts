import * as _ from 'lodash';
import { IAssertDist, IEnvOption, Operation, ITaskContext, ITaskConfig, ITaskInfo, Src, IPipeOption } from './TaskConfig';
import { generateTask } from './generateTask';
import { runSequence, addToSequence } from './taskSequence';
import { files, taskStringVal, taskSourceVal, absoluteSrc, absolutePath } from './utils';
import { findTasksInModule, findTaskDefineInModule, findTasksInDir, findTaskDefineInDir } from './decorator';




/**
 * binding Config to implement default func.
 * 
 * @export
 * @param {ITaskConfig} cfg
 * @returns {ITaskContext}
 */
export function bindingConfig(cfg: ITaskConfig): ITaskContext {

    let oper = currentOperation(cfg.env);

    let context: ITaskContext = <ITaskContext>{
        oper: oper,

        env: cfg.env,
        globals: cfg.globals || {},
        option: cfg.option,
        runTasks: cfg.runTasks,

        fileFilter: files,
        runSequence: runSequence,
        addToSequence: cfg.addToSequence || addToSequence,
        generateTask(tasks, match?) {
            return generateTask(tasks, _.extend(createDefaultMatch(context), match || {}));
        },
        findTasks(mdl, match?) {
            return findTasksInModule(mdl, _.extend(createDefaultMatch(context), match || {}));
        },
        findTasksInDir(dirs, match?) {
            return findTasksInDir(dirs, _.extend(createDefaultMatch(context), match || {}));
        },

        findTaskDefine: findTaskDefineInModule.bind(this),

        findTaskDefineInDir: findTaskDefineInDir.bind(this),

        subTaskName(task, ext = '') {
            let name = '';
            // let oper = context.oper;
            if (_.isString(task)) {
                name = task;
            } else if (task && task !== context.option) {
                // oper = task.oper || context.oper;
                if (task.name) {
                    name = taskStringVal(task.name, context)
                }
                if (!name && task.assert && task.assert.name) {
                    name = taskStringVal(task.assert.name, context)
                }
            }

            let optName = taskStringVal(cfg.option.name, context);
            if (optName) {
                if (name.indexOf(optName + '-') === 0) {
                    return name;
                }
                // avoid soma name.
                if (name && optName !== name) {
                    return `${optName}-${name}` + ext;
                }
                return optName + ext;
            } else {
                return name + ext;
            }
        },

        getSrc(task: ITaskInfo, relative = false): Src {
            let src: Src;
            let oper = task ? (task.oper || context.oper) : context.oper;
            if (task && task.assert) {
                src = taskSourceVal(getAssertSrc(task.assert, oper), context)
            }
            if (!src) {
                src = taskSourceVal(getAssertSrc(cfg.option, oper), context)
            }
            return (relative !== false) ? src : absoluteSrc(cfg.env.root, src);
        },

        getDist(task: ITaskInfo, relative = false) {
            let dist;
            // let oper = task ? (task.oper || context.oper) : context.oper;
            if (task && task.assert) {
                dist = getCurrentDist(task.assert, context);
            }
            dist = dist || getCurrentDist(context.option, context);

            return (relative !== false) ? dist : absolutePath(cfg.env.root, dist);
        },

        toRootSrc(src: Src): Src {
            return absoluteSrc(cfg.env.root, src);
        },
        toRootPath(pathstr: string): string {
            return absolutePath(cfg.env.root, pathstr);
        }

        // pipeOption(express, route = true) {
        //     if (context.option) {
        //         let option = context.option;
        //         if (!route && option.pipe || option.pipes || option.source || option.output) {
        //             express(option);
        //         }
        //         if (option['loader'] && !_.isString(option['loader']) && !_.isArray(option['loader'])) {
        //             let opt = <IPipeOption>option['loader'];
        //             if (opt.pipe || opt.pipes || opt.source || opt.output) {
        //                 express(opt);
        //             }
        //         }
        //         if (route && option.pipe || option.pipes || option.source || option.output) {
        //             express(option);
        //         }
        //     }
        // }
    };

    return context;
}

let createDefaultMatch = (ctx: ITaskContext) => {
    let match: ITaskInfo = { oper: ctx.oper };
    if (ctx.match) {
        match.match = (anothor: ITaskInfo) => {
            return ctx.match(match, anothor);
        }
    }
    return match;
}


/**
 * get current env Operation.
 * 
 * @export
 * @param {EnvOption} env
 * @returns
 */
export function currentOperation(env: IEnvOption) {
    let oper: Operation;
    if (env.deploy) {
        oper = Operation.deploy;
    } else if (env.release) {
        oper = Operation.release;
    } else {
        oper = Operation.build;
    }

    if (env.watch) {
        oper = oper | Operation.watch;
    }
    if (env.test) {
        oper = oper | Operation.test;
    }
    if (env.serve) {
        oper = oper | Operation.serve;
    }
    if (env.e2e) {
        oper = oper | Operation.e2e;
    }

    return oper;
}

/**
 * get assert source.
 * 
 * @param {IAssertDist} assert
 * @param {Operation} oper
 * @returns
 */
function getAssertSrc(assert: IAssertDist, oper: Operation) {
    let src = null;

    if ((oper & Operation.test) > 0) {
        src = assert.testSrc;
    } else if ((oper & Operation.e2e) > 0) {
        src = assert.e2eSrc;
    } else if ((oper & Operation.watch) > 0) {
        src = assert.watchSrc;
    } else if ((oper & Operation.clean) > 0) {
        src = assert.cleanSrc || assert.dist;
    }


    return src || assert.src;
}

/**
 * get dist.
 * 
 * @param {IAssertDist} ds
 * @param {ITaskContext} ctx
 * @returns
 */
function getCurrentDist(ds: IAssertDist, ctx: ITaskContext) {
    let dist: string;
    let env = ctx.env;
    let oper = ctx.oper;
    if (env.deploy || (oper & Operation.deploy) > 0) {
        dist = ds.deployDist || taskStringVal(ds.dist, ctx);
    } else if (env.release || (oper & Operation.release) > 0) {
        dist = ds.releaseDist || taskStringVal(ds.dist, ctx);
    } else if (env.e2e || (oper & Operation.e2e) > 0) {
        dist = ds.e2eDist || ds.buildDist || taskStringVal(ds.dist, ctx);
    } else if (env.test || (oper & Operation.test) > 0) {
        dist = ds.testDist || ds.buildDist || taskStringVal(ds.dist, ctx);
    } else if ((oper & Operation.build) > 0) {
        dist = ds.buildDist || taskStringVal(ds.dist, ctx);
    }

    return dist;
}
