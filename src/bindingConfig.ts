import * as _ from 'lodash';
import { IAssertDist, IEnvOption, Operation, ITaskConfig, ITaskInfo, Src } from './TaskConfig';
import { generateTask } from './generateTask';
import { runSequence, addToSequence } from './taskSequence';
import { files, taskStringVal, taskSourceVal } from './utils';
import { findTasksInModule, findTaskDefineInModule, findTasksInDir, findTaskDefineInDir } from './decorator';




/**
 * binding Config to implement default func.
 * 
 * @export
 * @param {TaskConfig} cfg
 * @returns {TaskConfig}
 */
export function bindingConfig(cfg: ITaskConfig): ITaskConfig {
    if (!cfg.oper) {
        cfg.oper = currentOperation(cfg.env);
    }
    cfg.fileFilter = cfg.fileFilter || files;
    cfg.runSequence = cfg.runSequence || runSequence;
    cfg.addToSequence = cfg.addToSequence || addToSequence;
    cfg.generateTask = cfg.generateTask || ((tasks, match?) => {
        return generateTask(tasks, _.extend({ oper: cfg.oper, watch: cfg.env.watch }, match || {}));
    });

    cfg.findTasks = cfg.findTasks || ((mdl, match?) => {
        return findTasksInModule(mdl, _.extend({ oper: cfg.oper, watch: cfg.env.watch }, match || {}));
    });
    cfg.findTasksInDir = cfg.findTasksInDir || ((dirs, match?) => {
        return findTasksInDir(dirs, _.extend({ oper: cfg.oper, watch: cfg.env.watch }, match || {}));
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
        return src
    });

    cfg.getDist = cfg.getDist || ((ds?: IAssertDist) => {
        if (ds) {
            let dist = getCurrentDist(ds, cfg.oper);
            if (dist) {
                return dist;
            }
        }
        return getCurrentDist(cfg.option, cfg.oper);
    });

    return cfg;
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
    } else if (env.e2e) {
        oper = Operation.e2e;
    } else if (env.test) {
        oper = Operation.test;
    } else {
        oper = Operation.build;
    }

    return oper;
}


function getAssertSrc(assert: IAssertDist, taskinfo?: ITaskInfo) {
    let src = null;
    if (taskinfo) {
        if (taskinfo.test) {
            src = assert.testSrc;
        } else if (taskinfo.e2e) {
            src = assert.e2eSrc;
        } else if (taskinfo.watch) {
            src = assert.watchSrc;
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
    switch (oper) {
        case Operation.build:
            dist = ds.buildDist || taskStringVal(ds.dist, oper);
            break;
        case Operation.test:
            dist = ds.testDist || ds.buildDist || taskStringVal(ds.dist, oper);
            break;
        case Operation.e2e:
            dist = ds.e2eDist || ds.buildDist || taskStringVal(ds.dist, oper);
            break;
        case Operation.release:
            dist = ds.releaseDist || taskStringVal(ds.dist, oper);
            break;
        case Operation.deploy:
            dist = ds.deployDist || taskStringVal(ds.dist, oper);
            break;
        default:
            dist = '';
            break;
    }
    return dist;
}


