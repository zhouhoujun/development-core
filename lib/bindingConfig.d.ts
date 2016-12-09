/// <reference types="chai" />
/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskDefine, TaskResult, IEnvOption, Operation, ITaskContext, ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString, folderCallback } from './TaskConfig';
/**
 * binding Config, create task context.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @param {ITaskContext} [parent]
 * @returns {ITaskContext}
 */
export declare function bindingConfig(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;
/**
 * TaskContext
 *
 * @export
 * @class TaskContext
 * @implements {ITaskContext}
 */
export declare class TaskContext implements ITaskContext {
    private cfg;
    parent: ITaskContext;
    oper: Operation;
    option: IAsserts;
    env: IEnvOption;
    globals: any;
    protected setupTasks: ITask[];
    protected children: ITaskContext[];
    constructor(cfg: ITaskConfig, parent?: ITaskContext);
    /**
     * add sub ITaskContext
     *
     * @param {ITaskContext} context
     *
     * @memberOf ITaskContext
     */
    add(context: ITaskContext): void;
    /**
     * remove sub ITaskContext.
     *
     * @param {ITaskContext} [context]
     *
     * @memberOf ITaskContext
     */
    remove(context?: ITaskContext): ITaskContext[];
    /**
     * find sub context via express.
     *
     * @param {(ITaskContext | ((item: ITaskContext) => boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     * @returns {ITaskContext}
     *
     * @memberOf ITaskContext
     */
    find(express: ITaskContext | ((item: ITaskContext) => boolean), mode?: string): ITaskContext;
    /**
     * filter items.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     * @returns {ITaskContext[]}
     *
     * @memberOf ITaskContext
     */
    filter(express: ((item: ITaskContext) => void | boolean), mode?: string): ITaskContext[];
    /**
     * find parent context via express.
     *
     * @param {(ITaskContext | ((item: ITaskContext) => boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     *
     * @memberOf ITaskContext
     */
    each(express: ((item: ITaskContext) => void | boolean), mode?: string): any;
    eachChildren(express: ((item: ITaskContext) => void | boolean)): void;
    /**
     * do express work in routing.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     *
     * @memberOf ITaskContext
     */
    route(express: ((item: ITaskContext) => void | boolean)): any;
    /**
     * translate all sub context to do express work.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     *
     * @memberOf ITaskContext
     */
    trans(express: ((item: ITaskContext) => void | boolean)): boolean;
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;
    getSrc(task?: ITaskInfo, relative?: boolean): Src;
    getDist(task?: ITaskInfo, relative?: boolean): string;
    subTaskName(task: any, ext?: string): string;
    printHelp(lang: string): void;
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;
    findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]>;
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
    runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask(tasks: any, match?: any): any;
    addToSequence(sequence: Src[], task: ITaskInfo): Src[];
    getRootPath(): string;
    getRootFolders(express?: folderCallback): string[];
    getFolders(pathstr: string, express?: folderCallback): string[];
    getDistFolders(express?: folderCallback, task?: ITaskInfo): string[];
    toRootSrc(src: Src): Src;
    toRootPath(pathstr: string): string;
    toDistSrc(src: Src, task?: ITaskInfo): Src;
    toDistPath(pathstr: string, task?: ITaskInfo): string;
    to<T>(setting: T | ((ctx: ITaskContext) => T)): T;
    toSrc(source: TaskSource): Src;
    toStr(name: TaskString): string;
    toUrl(basePath: string, toPath?: string): string;
    private packages;
    getPackage(filename?: TaskString): any;
    setup(task: ITask, gulp?: Gulp): TaskResult;
    tasks(express?: (item: ITask) => boolean): ITask[];
    registerTasks(express?: (item: ITask) => boolean): ITask[];
    globalTasks(): string[];
}
/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
export declare function currentOperation(env: IEnvOption): Operation;
/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export declare function files(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
/**
 * task src, string or array string.
 *
 * @export
 * @param {TaskSource} src
 * @param {Operation} oper runtime Operation
 * @param {IEnvOption} [env]
 * @returns
 */
export declare function taskSourceVal(src: TaskSource, ctx: ITaskContext): string | string[];
/**
 * task string.
 *
 * @export
 * @param {TaskString} name
 * @param {ITaskContext} ctx
 * @returns
 */
export declare function taskStringVal(name: TaskString, ctx: ITaskContext): string;
