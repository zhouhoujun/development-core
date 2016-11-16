/// <reference types="chai" />
import 'reflect-metadata';
import { ITask, ITaskDecorator, IContextDefine, ITaskDefine, Src } from './TaskConfig';
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
 * find tasks in Object module.
 *
 * @export
 * @param {*} target
 * @param {ITaskDecorator} [match]
 * @returns {ITask[]}
 */
export declare function findTasks(target: any, match?: ITaskDecorator): ITask[];
/**
 * decorator task define implements IContextDefine.
 *
 * @export
 * @param {Function} constructor
 */
export declare function taskdefine<T extends Function>(target?: (new <T>() => T)): any;
/**
 * get all taskdefine in module.
 *
 * @export
 * @param {any} target
 * @returns
 */
export declare function findTaskDefines(target: any): IContextDefine[];
/**
 * get one taskdefine in module.
 *
 * @export
 * @param {any} target
 * @returns
 */
export declare function findTaskDefine(target: any): IContextDefine;
/**
 * find one taskdefine in module.
 *
 * @export
 * @param {(string | Object)} md
 * @returns {Promise<IContextDefine>}
 */
export declare function findTaskDefineInModule(md: string | Object): Promise<IContextDefine>;
/**
 * fund tasks in module.
 *
 * @export
 * @param {(string | Object)} md
 * @param {ITaskDecorator} [match]
 * @returns {Promise<ITask[]>}
 */
export declare function findTasksInModule(md: string | Object, match?: ITaskDecorator): Promise<ITask[]>;
/**
 * find one task define in directories.
 *
 * @export
 * @param {Src} dirs
 * @returns {Promise<IContextDefine>}
 */
export declare function findTaskDefineInDir(dirs: Src): Promise<IContextDefine>;
/**
 * find tasks in directories.
 *
 * @export
 * @param {Src} dirs
 * @param {ITaskDecorator} [match]
 * @returns {Promise<ITask[]>}
 */
export declare function findTasksInDir(dirs: Src, match?: ITaskDecorator): Promise<ITask[]>;
/**
 * task define context convert.
 *
 * @export
 * @param {ITaskDefine} tdef
 * @returns {IContextDefine}
 */
export declare function taskDefine2Context(tdef: ITaskDefine): IContextDefine;
