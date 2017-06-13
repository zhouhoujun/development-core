import 'reflect-metadata';
import { ITask, ITaskDecorator, ITaskContext, ITaskDefine, Src } from './TaskConfig';
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
 * @param {ITaskContext} [ctx]
 * @returns {ITask[]}
 */
export declare function findTasks(target: any, match?: ITaskDecorator, ctx?: ITaskContext): ITask[];
/**
 * decorator task define implements ITaskDefine.
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
export declare function findTaskDefines(target: any): ITaskDefine[];
/**
 * get one taskdefine in module.
 *
 * @export
 * @param {any} target
 * @returns
 */
export declare function findTaskDefine(target: any): ITaskDefine;
/**
 * find one taskdefine in module.
 *
 * @export
 * @param {(string | Object)} md
 * @returns {Promise<ITaskDefine>}
 */
export declare function findTaskDefineInModule(md: string | Object): Promise<ITaskDefine>;
/**
 * fund tasks in module.
 *
 * @export
 * @param {(string | Object)} md
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
export declare function findTasksInModule(md: string | Object, match?: ITaskDecorator, ctx?: ITaskContext): Promise<ITask[]>;
/**
 * find one task define in directories.
 *
 * @export
 * @param {Src} dirs
 * @returns {Promise<ITaskDefine>}
 */
export declare function findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
/**
 * find tasks in directories.
 *
 * @export
 * @param {Src} dirs
 * @param {ITaskDecorator} [match]
 * @param {ITaskContext} [ctx]
 * @returns {Promise<ITask[]>}
 */
export declare function findTasksInDir(dirs: Src, match?: ITaskDecorator, ctx?: ITaskContext): Promise<ITask[]>;
