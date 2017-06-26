import 'reflect-metadata';
import * as _ from 'lodash';
import { ITaskDecorator } from './TaskConfig';


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
 * decorator task define implements ITaskDefine.
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

