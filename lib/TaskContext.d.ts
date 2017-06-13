/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, TaskResult, IEnvOption, Operation, ITaskContext, ITaskDefine, IDynamicTaskOption, ZipTaskName, Express, Mode, ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString, folderCallback } from './TaskConfig';
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
 * create Task context.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @param {ITaskContext} [parent]
 * @returns {ITaskContext}
 */
export declare function createContext(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;
/**
 * TaskContext
 *
 * @export
 * @class TaskContext
 * @implements {ITaskContext}
 */
export declare class TaskContext implements ITaskContext {
    parent: ITaskContext;
    oper: Operation;
    option: IAsserts;
    env: IEnvOption;
    protected cfg: ITaskConfig;
    globals: any;
    protected setupTasks: ITask[];
    protected children: ITaskContext[];
    constructor(cfg: ITaskConfig, parent?: ITaskContext);
    private _gulp;
    gulp: Gulp;
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
     * load config
     *
     * @param {ITaskConfig} cfg
     *
     * @memberof TaskContext
     */
    loadConfig(cfg: ITaskConfig): void;
    /**
     * get config.
     *
     * @returns {ITaskConfig}
     *
     * @memberof TaskContext
     */
    getConfig(): ITaskConfig;
    /**
     * find sub context via express.
     *
     * @param {(ITaskContext | Express<ITaskContext, boolean>} express
     * @param {Mode} [mode] default traverse.
     * @returns {ITaskContext}
     *
     * @memberOf ITaskContext
     */
    find(express: ITaskContext | Express<ITaskContext, boolean>, mode?: Mode): ITaskContext;
    /**
     * filter items.
     *
     * @param {Express<ITaskContext, void | boolean>} express
     * @param {Mode} [mode] {enum:['route','children', traverse']} default traverse.
     * @returns {ITaskContext[]}
     *
     * @memberOf ITaskContext
     */
    filter(express: Express<ITaskContext, void | boolean>, mode?: Mode): ITaskContext[];
    /**
     * find parent context via express.
     *
     * @param {(ITaskContext | Express<ITaskContext, boolean>)} express
     * @param {Mode} [mode] {enum:['route','children', traverse']} default traverse.
     *
     * @memberOf ITaskContext
     */
    each(express: Express<ITaskContext, void | boolean>, mode?: Mode): any;
    /**
     *map context.
     *
     * @template T
     * @param {Express<ITaskContext, T>} express
     * @param {Mode} [mode]
     * @param {Express<ITaskContext, boolean>} [filter]
     * @returns {T[]}
     *
     * @memberof TaskContext
     */
    map<T>(express: Express<ITaskContext, T>, mode?: Mode, filter?: Express<ITaskContext, boolean>): T[];
    eachChildren(express: Express<ITaskContext, void | boolean>): void;
    /**
     * do express work in routing.
     *
     * @param {Express<ITaskContext, void | boolean>} express
     *
     * @memberOf ITaskContext
     */
    route(express: Express<ITaskContext, void | boolean>): any;
    /**
     * translate all sub context to do express work.
     *
     * @param {Express<ITaskContext, void | boolean>} express
     *
     * @memberOf ITaskContext
     */
    trans(express: Express<ITaskContext, void | boolean>): boolean;
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;
    getSrc(task?: ITaskInfo, relative?: boolean): Src;
    getDist(task?: ITaskInfo, relative?: boolean): string;
    subTaskName(task: any, ext?: string): string;
    printHelp(lang: string): void;
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;
    findTasksInDir(dirs: TaskSource, match?: ITaskInfo): Promise<ITask[]>;
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir(dirs: TaskSource): Promise<ITaskDefine>;
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
    /**
     * to Sequence.
     *
     * @param {ITask[]} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {Src[]}
     *
     * @memberof TaskContext
     */
    toSequence(tasks: ITask[], zipName?: ZipTaskName): Src[];
    /**
     * filter file in directory.  default implement in bindingConfig.
     *
     * @param {Gulp} gulp
     * @param {Src[]} tasks
     * @returns {Promise<any>}
     *
     * @memberOf ITaskContext
     */
    runSequence(tasks: Src[]): Promise<any>;
    /**
     * run task sequence in this context.
     *
     * @param {(ITask[] | Promise<ITask[]>)} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {Promise<any>}
     *
     * @memberof TaskContext
     */
    runTaskSequence(tasks: ITask[] | Promise<ITask[]>, zipName?: ZipTaskName): Promise<any>;
    /**
     * zip task sequence.
     *
     * @param {Src[]} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    zipSequence(tasks: Src[], zipName?: ZipTaskName): string;
    /**
     * flattenSequence in this context.
     *
     * @param {Src[]} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {string[]}
     *
     * @memberof ITaskContext
     */
    flattenSequence(tasks: Src[], zipName?: ZipTaskName): string[];
    /**
     * dynamic generate tasks.  default implement in bindingConfig.
     *
     * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
     * @param {ITaskInfo} [match]
     * @returns {ITask[]}
     *
     * @memberOf ITaskContext
     */
    generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];
    /**
     * add task result to task sequence. default implement in bindingConfig.
     *
     * @param {Src[]} sequence  task sequence.
     * @param {ITaskInfo} task
     * @returns {Src[]}
     *
     * @memberOf ITaskContext
     */
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
