import 'reflect-metadata';

import { Operation } from './TaskConfig';

const taskMetadataKey = Symbol('task');
/**
 * task decorator.
 * 
 * @export
 * @param {string} type
 * @returns
 */
export function task(oper?: Operation, order?: number, name?: string) {
    return Reflect.metadata(taskMetadataKey, { name: name, oper: oper, order: order });
}

export function getTask(target: Object, type: string) {
    return Reflect.getMetadata(taskMetadataKey, target, type);
}


const taskconfigrMetadataKey = Symbol('taskconfig');
/**
 * task loader decorator.
 * 
 * @export
 * @param {string} type
 * @returns
 */
export function taskconfig(oper?: Operation) {
    return Reflect.metadata(taskconfigrMetadataKey, oper);
}

export function getTaskconfig(target: Object, oper?: Operation) {
    return Reflect.getMetadata(taskconfigrMetadataKey, target);
}


const taskloaderMetadataKey = Symbol('taskloader');
/**
 * task loader decorator.
 * 
 * @export
 * @param {string} type
 * @returns
 */
export function taskloader(oper?: Operation) {
    return Reflect.metadata(taskloaderMetadataKey, oper);
}

export function getTaskloader(target: Object, oper?: Operation) {
    return Reflect.getMetadata(taskloaderMetadataKey, target);
}

const taskdefineMetadataKey = Symbol('taskdefine');
/**
 * decorator task define implements ITaskDefine.
 * 
 * @export
 * @param {Function} constructor
 */
export function taskdefine(constructor: Function) {
    return Reflect.metadata(taskdefineMetadataKey, constructor);
}

/**
 * get taskdefine in module.
 * 
 * @export
 * @param {any} target
 * @returns
 */
export function findTaskDefine(target) {
    return Reflect.getMetadata(taskMetadataKey, target);
}
