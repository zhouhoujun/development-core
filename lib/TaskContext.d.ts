/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, IEnvOption, Operation, ITaskContext, ITaskDefine, IDynamicTaskOption, Builder, IAssertOption, ZipTaskName, Express, Mode, ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString, folderCallback } from './TaskConfig';
/**
 *binding Config, create task context.
 *
 *@export
 *@param {ITaskConfig} cfg
 *@param {ITaskContext} [parent]
 *@returns {ITaskContext}
 */
export declare function bindingConfig(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;
/**
 *create Task context.
 *
 *@export
 *@param {ITaskConfig | IAssertOption} cfg
 *@param {ITaskContext} [parent]
 *@returns {ITaskContext}
 */
export declare function createContext(cfg: ITaskConfig | IAssertOption, parent?: ITaskContext): ITaskContext;
/**
 *TaskContext
 *
 *@export
 *@class TaskContext
 *@implements {ITaskContext}
 */
export declare class TaskContext implements ITaskContext {
    protected cfg: ITaskConfig;
    protected taskseq: ITask[];
    protected sequence: Src[];
    protected children: ITaskContext[];
    oper: Operation;
    option: IAsserts;
    env: IEnvOption;
    globals: any;
    parent: ITaskContext;
    constructor(cfg: ITaskConfig);
    private _gulp;
    gulp: Gulp;
    protected _builder: Builder;
    builder: Builder;
    protected createEnv(): IEnvOption;
    protected setEnvViaOperate(oper: Operation): void;
    /**
     *load config
     *
     *@param {ITaskConfig} cfg
     *
     *@memberof TaskContext
     */
    setConfig(cfg: ITaskConfig): void;
    /**
     *get config.
     *
     *@returns {ITaskConfig}
     *
     *@memberof TaskContext
     */
    getConfig(): ITaskConfig;
    protected isConfig(obj: any): boolean;
    /**
     * add sub ITaskContext
     *
     * @param {(ITaskContext | ITaskConfig | IAssertOption)} context
     * @returns {ITaskContext} sub context.
     * @memberof TaskContext
     */
    add(context: ITaskContext | ITaskConfig | IAssertOption): ITaskContext;
    /**
     * create context.
     *
     * @protected
     * @param {(ITaskConfig)} cfg
     * @returns {ITaskContext}
     * @memberof TaskContext
     */
    protected createContext(cfg: ITaskConfig): ITaskContext;
    /**
     *remove sub ITaskContext.
     *
     *@param {ITaskContext} [context]
     *
     *@memberOf ITaskContext
     */
    remove(context?: ITaskContext): ITaskContext[];
    /**
     * is task class.
     *
     * @param {any} obj
     * @returns {boolean}
     * @memberof TaskContext
     */
    isTask(obj: any): boolean;
    /**
     *find sub context via express.
     *
     *@template T
     *@param {(T | Express<T, boolean>)} express
     *@param {Mode} [mode]
     *@returns {T}
     *@memberof TaskContext
     */
    find<T extends ITaskContext>(express: T | Express<T, boolean>, mode?: Mode): T;
    /**
     *filter items.
     *
     *@template T
     *@param {(Express<T, void | boolean>)} express
     *@param {Mode} [mode]
     *@returns {ITaskContext[]}
     *@memberof TaskContext
     */
    filter<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode): T[];
    /**
     *find parent context via express.
     *
     *@param {(ITaskContext | Express<ITaskContext, boolean>)} express
     *@param {Mode} [mode] {enum:['route','children', traverse']} default traverse.
     *
     *@memberOf ITaskContext
     */
    each<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode): any;
    /**
     * map context.
     *
     *@template T
     *@param {Express<ITaskContext, T>} express
     *@param {Mode} [mode]
     *@param {Express<ITaskContext, boolean>} [filter]
     *@returns {T[]}
     *
     *@memberof TaskContext
     */
    map<T>(express: Express<ITaskContext, T>, mode?: Mode, filter?: Express<ITaskContext, boolean>): T[];
    eachChildren(express: Express<ITaskContext, void | boolean>): void;
    /**
     *do express work in routing.
     *
     *@param {Express<ITaskContext, void | boolean>} express
     *
     *@memberOf ITaskContext
     */
    route(express: Express<ITaskContext, void | boolean>): any;
    /**
     *translate all sub context to do express work.
     *
     *@param {Express<ITaskContext, void | boolean>} express
     *
     *@memberOf ITaskContext
     */
    trans(express: Express<ITaskContext, void | boolean>): boolean;
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;
    getSrc(task?: ITaskInfo, relative?: boolean): Src;
    getDist(task?: ITaskInfo, relative?: boolean): string;
    subTaskName(task: TaskString | ITaskInfo, ext?: string): string;
    taskName(task: TaskString | ITaskInfo, ext?: string): string;
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;
    findTasksInDir(dirs: TaskSource, match?: ITaskInfo): Promise<ITask[]>;
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir(dirs: TaskSource): Promise<ITaskDefine>;
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
    /**
     *to Sequence.
     *
     *@param {ITask[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {Src[]}
     *
     *@memberof TaskContext
     */
    toSequence(tasks: ITask[], zipName?: ZipTaskName): Src[];
    /**
     *filter file in directory.  default implement in bindingConfig.
     *
     *@param {Gulp} gulp
     *@param {Src[]} tasks
     *@returns {Promise<any>}
     *
     *@memberOf ITaskContext
     */
    runSequence(tasks: Src[]): Promise<any>;
    /**
     *run task sequence in this context.
     *
     *@param {(ITask[] | Promise<ITask[]>)} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {Promise<any>}
     *
     *@memberof TaskContext
     */
    runTaskSequence(tasks: ITask[] | Promise<ITask[]>, zipName?: ZipTaskName): Promise<any>;
    /**
     *zip task sequence.
     *
     *@param {Src[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {string}
     *
     *@memberof ITaskContext
     */
    zipSequence(tasks: Src[], zipName?: ZipTaskName): string;
    /**
     *flattenSequence in this context.
     *
     *@param {Src[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {string[]}
     *
     *@memberof ITaskContext
     */
    flattenSequence(tasks: Src[], zipName?: ZipTaskName): string[];
    /**
     *dynamic generate tasks.  default implement in bindingConfig.
     *
     *@param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
     *@param {ITaskInfo} [match]
     *@returns {ITask[]}
     *
     *@memberOf ITaskContext
     */
    generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];
    /**
     *add task result to task sequence. default implement in bindingConfig.
     *
     *@param {Src[]} sequence  task sequence.
     *@param {ITaskInfo} task
     *@returns {Src[]}
     *
     *@memberOf ITaskContext
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
    setup(): Promise<Src[]>;
    getRunSequence(): Src[];
    load(): Src[] | Promise<Src[]>;
    addTask(...task: ITask[]): void;
    removeTask(task: ITask): ITask[] | Promise<ITask[]>;
    /**
     *run task in this context.
     *
     *@returns {Promise<any>}
     *
     *@memberof TaskContext
     */
    run(): Promise<any>;
    help(): void;
    tasks(express?: (item: ITask) => boolean): ITask[];
    registerTasks(express?: (item: ITask) => boolean): ITask[];
    globalTasks(): string[];
}
