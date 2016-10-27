import * as _ from 'lodash';
import { IDynamicTask, IOutputDist, IEnvOption, Operation, ITaskConfig, TaskResult, Src } from './TaskConfig';
import { generateTask } from './generateTask';
import { runSequence } from './runSequence';
import { files, taskStringVal } from './utils';

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
    cfg.addTask = cfg.addTask || addTask;
    cfg.generateTask = cfg.generateTask || ((tasks: IDynamicTask | IDynamicTask[]) => {
        return generateTask(tasks, cfg.oper, cfg.env);
    });
    cfg.subTaskName = cfg.subTaskName || ((name, deft = '') => {
        return cfg.option.name ? `${cfg.option.name}-${name || deft}` : name;
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



function addTask(taskSequence: Src[], rst: TaskResult) {
    if (!rst) {
        return taskSequence;
    }
    if (_.isString(rst) || _.isArray(rst)) {
        taskSequence.push(rst);
    } else if (rst.name) {
        if (_.isNumber(rst.order) && rst.order >= 0 && rst.order < taskSequence.length) {
            taskSequence.splice(rst.order, 0, rst.name);
            return taskSequence;
        }
        taskSequence.push(rst.name);
    }
    return taskSequence;
}
