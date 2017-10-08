import 'reflect-metadata';
import { ITaskDecorator } from './ITaskDecorator';
/**
 * task decorator.
 *
 * @export
 * @param {ITaskDecorator} type
 * @returns
 */
export declare function task<T extends Function>(target?: (new <T>() => T) | ITaskDecorator): any;
/**
 * dynamic task decorator.
 *
 * @export
 * @template T
 * @param {((new <T>() => T) | ITaskDecorator)} [target]
 * @returns {*}
 */
export declare function dynamicTask<T extends Function>(target?: (new <T>() => T) | ITaskDecorator): any;
/**
 * decorator task define implements ITaskDefine.
 *
 * @export
 * @param {Function} constructor
 */
export declare function taskdefine<T extends Function>(target?: (new <T>() => T)): any;
