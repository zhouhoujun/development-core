import * as _ from 'lodash';
import { IDynamicTask, IOutputDist, IEnvOption, Operation, ITaskConfig, IAsserts, Src } from './TaskConfig';
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
    cfg.generateTask = cfg.generateTask || ((tasks: IDynamicTask | IDynamicTask[]) => {
        return generateTask(tasks, { oper: cfg.oper, watch: cfg.env.watch });
    });

    cfg.findTasks = cfg.findTasks || findTasksInModule.bind(cfg);
    cfg.findTasksInDir = cfg.findTasksInDir || findTasksInDir.bind(cfg);

    cfg.findTaskDefine = cfg.findTaskDefine || findTaskDefineInModule.bind(cfg);
    cfg.findTaskDefineInDir = cfg.findTaskDefineInDir || findTaskDefineInDir.bind(cfg);

    cfg.subTaskName = cfg.subTaskName || ((dt, deft = '') => {
        let name = '';
        if (_.isString(dt)) {
            name = dt;
        } else if (dt) {
            name = taskStringVal(dt.name, cfg.oper)
        }
        let parentName = taskStringVal(cfg.option.name, cfg.oper);

        return parentName ? `${parentName}-${name || deft}` : name;
    });

    cfg.getSrc = cfg.getSrc || ((assert?: IAsserts): Src => {
        let src: Src;
        if (assert) {
            src = taskSourceVal(assert.src, cfg.oper)
        }
        if (!src) {
            src = taskSourceVal(cfg.option.src, cfg.oper)
        }
        return src
    });

    cfg.getDist = cfg.getDist || ((ds?: IOutputDist) => {
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


/**
 * get dist.
 * 
 * @param {OutputDist} ds
 * @param {Operation} oper
 * @returns
 */
function getCurrentDist(ds: IOutputDist, oper: Operation) {
    let dist: string;
    switch (oper) {
        case Operation.build:
            dist = ds.build || taskStringVal(ds.dist, oper);
            break;
        case Operation.test:
            dist = ds.test || ds.build || taskStringVal(ds.dist, oper);
            break;
        case Operation.e2e:
            dist = ds.e2e || ds.build || taskStringVal(ds.dist, oper);
            break;
        case Operation.release:
            dist = ds.release || taskStringVal(ds.dist, oper);
            break;
        case Operation.deploy:
            dist = ds.deploy || taskStringVal(ds.dist, oper);
            break;
        default:
            dist = '';
            break;
    }
    return dist;
}


