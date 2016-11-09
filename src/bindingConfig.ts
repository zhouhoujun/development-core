import * as _ from 'lodash';
import { IAssertDist, IEnvOption, Operation, ITaskConfig, ITaskInfo, Src } from './TaskConfig';
import { generateTask } from './generateTask';
import { runSequence, addToSequence } from './taskSequence';
import { files, taskStringVal, taskSourceVal, absoluteSrc, absolutePath } from './utils';
import { findTasksInModule, findTaskDefineInModule, findTasksInDir, findTaskDefineInDir } from './decorator';





/**
 * binding Config to implement default func.
 * 
 * @export
 * @param {TaskConfig} cfg
 * @returns {TaskConfig}
 */
export function bindingConfig(cfg: ITaskConfig): ITaskConfig {
    // if (!cfg.oper) {
    //     cfg.oper = currentOperation(cfg.env);
    // }
    currentOperation(cfg.env, cfg);

    cfg.fileFilter = cfg.fileFilter || files;
    cfg.runSequence = cfg.runSequence || runSequence;
    cfg.addToSequence = cfg.addToSequence || addToSequence;
    cfg.generateTask = cfg.generateTask || ((tasks, match?) => {
        return generateTask(tasks, _.extend(createDefaultMatch(cfg), match || {}));
    });

    cfg.findTasks = cfg.findTasks || ((mdl, match?) => {
        return findTasksInModule(mdl, _.extend(createDefaultMatch(cfg), match || {}));
    });
    cfg.findTasksInDir = cfg.findTasksInDir || ((dirs, match?) => {
        return findTasksInDir(dirs, _.extend(createDefaultMatch(cfg), match || {}));
    });

    cfg.findTaskDefine = cfg.findTaskDefine || findTaskDefineInModule.bind(cfg);
    cfg.findTaskDefineInDir = cfg.findTaskDefineInDir || findTaskDefineInDir.bind(cfg);

    cfg.subTaskName = cfg.subTaskName || ((dt, deft = '') => {
        let name = '';
        if (_.isString(dt)) {
            name = dt;
        } else if (dt && cfg.option !== dt) {
            name = taskStringVal(dt.name, cfg.oper)
        } else {
            name = deft;
        }
        let parentName = taskStringVal(cfg.option.name, cfg.oper);

        return parentName ? `${parentName}-${name}` : name;
    });

    cfg.getSrc = cfg.getSrc || ((assert?: IAssertDist, taskinfo?: ITaskInfo): Src => {
        let src: Src;
        if (assert) {
            src = taskSourceVal(getAssertSrc(assert, taskinfo), cfg.oper)
        }
        if (!src) {
            src = taskSourceVal(getAssertSrc(cfg.option, taskinfo), cfg.oper)
        }
        return (cfg.autoJoinRoot === false) ? src : absoluteSrc(cfg.env.root, src);
    });

    cfg.getDist = cfg.getDist || ((ds?: IAssertDist) => {
        let dist;
        if (ds) {
            dist = getCurrentDist(ds, cfg.oper);
        }
        dist = dist || getCurrentDist(cfg.option, cfg.oper);

        return (cfg.autoJoinRoot === false) ? dist : absolutePath(cfg.env.root, dist);
    });

    cfg.toRootSrc = cfg.toRootSrc || ((src: Src): Src => {
        return absoluteSrc(cfg.env.root, src);
    });

    cfg.toRootPath = cfg.toRootPath || ((pathstr: string): string => {
        return absolutePath(cfg.env.root, pathstr);
    });

    return cfg;
}

let createDefaultMatch = (cfg: ITaskConfig) => {
    let match: ITaskInfo = { oper: cfg.oper };
    if (cfg.match) {
        match.match = (anothor: ITaskInfo) => {
            return cfg.match(match, anothor);
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
export function currentOperation(env: IEnvOption, cfg?: ITaskConfig) {
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


    if (cfg) {
        cfg.oper = (cfg.oper || 0) | oper;
        return cfg.oper;
    } else {
        return oper;
    }
}


function getAssertSrc(assert: IAssertDist, taskinfo?: ITaskInfo) {
    let src = null;
    if (taskinfo) {
        taskinfo.oper = taskinfo.oper || Operation.default;
        if ((taskinfo.oper & Operation.test) > 0) {
            src = assert.testSrc;
        } else if ((taskinfo.oper & Operation.e2e) > 0) {
            src = assert.e2eSrc;
        } else if ((taskinfo.oper & Operation.watch) > 0) {
            src = assert.watchSrc;
        } else if ((taskinfo.oper & Operation.clean) > 0) {
            src = assert.cleanSrc || assert.dist;
        }
    }

    return src || assert.src;
}

/**
 * get dist.
 * 
 * @param {OutputDist} ds
 * @param {Operation} oper
 * @returns
 */
function getCurrentDist(ds: IAssertDist, oper: Operation) {
    let dist: string;
    if ((oper & Operation.build) > 0) {
        dist = ds.buildDist || taskStringVal(ds.dist, oper);
    } else if ((oper & Operation.release) > 0) {
        dist = ds.releaseDist || taskStringVal(ds.dist, oper);
    } else if ((oper & Operation.deploy) > 0) {
        dist = ds.deployDist || taskStringVal(ds.dist, oper);
    } else if ((oper & Operation.test) > 0) {
        dist = ds.testDist || ds.buildDist || taskStringVal(ds.dist, oper);
    } else if ((oper & Operation.e2e) > 0) {
        dist = ds.e2eDist || ds.buildDist || taskStringVal(ds.dist, oper);
    }

    return dist;
}


