import { Gulp, WatchEvent, WatchCallback, TaskCallback } from 'gulp';


/**
 * mutil source stream pipe task run way, task runway, or same level context run way.
 *
 * @export
 * @enum {number}
 */
export enum RunWay {
    /**
     * run mutil source stream by sequence.
     */
    sequence = 1,
    /**
     * run mutil source stream by parallel.
     */
    parallel = 2
}

/**
 * current context run sequence with children context node.
 *
 * @export
 * @enum {number}
 */
export enum NodeSequence {
    /**
     * current context node run tasks before childe node run.
     */
    before = 1,
    /**
     * current context node run tasks after childe node run.
     */
    after = 2
}


export enum Mode {
    route = 1,
    children,
    traverse
}

/**
 * project development build operation.
 *
 * @export
 * @enum {number}
 */
export enum Operation {
    /**
     * build compile project.
     */
    build = 1 << 0,
    /**
     * test project.
     */
    test = 1 << 1,
    /**
     * e2e test project.
     */
    e2e = 1 << 2,
    /**
     * release project.
     */
    release = 1 << 3,
    /**
     * release and deploy project.
     */
    deploy = 1 << 4,
    /**
     * clean task
     */
    clean = 1 << 5,
    /**
     * serve task
     */
    serve = 1 << 6,

    /**
     * watch task.
     */
    watch = 1 << 7,

    /**
     * auto create watch
     */
    autoWatch = 1 << 8,

    /**
     * default operation.
     */
    default = Operation.build | Operation.release | Operation.deploy,

    /**
     * define watch Operation (Operation.build | Operation.test | Operation.e2e | Operation.watch)
     */
    defaultWatch = Operation.build | Operation.test | Operation.e2e | Operation.watch
}

/**
 * object map.
 *
 * @export
 * @interface IMap
 * @template T
 */
export interface IMap<T> {
    [K: string]: T;
}

export interface IOrder {
    /**
     * the value to sort sequence.
     *
     * @type {number}
     * @memberof IOrder
     */
    value?: number;
    /**
     * before the task to run.
     *
     * @type {string}
     * @memberof IOrder
     */
    before?: string;
    /**
     * afater the task to run.
     *
     * @type {string}
     * @memberof IOrder
     */
    after?: string;
    /**
     * run Way type.
     *
     * @type {RunWay}
     * @memberof IOrder
     */
    runWay?: RunWay;
}

/**
 * zip task name.
 */
export type ZipTaskName = (name: string, runWay?: RunWay, ctx?: ITaskContext) => string

/**
 * Order type.
 */
export type Order = number | IOrder | ((total: number, ctx?: ITaskContext) => number | IOrder);

/**
 * src
 */
export type Src = string | string[];

/**
 * async source.
 */
export type AsyncSrc = Src | Promise<Src>;

/**
 * operate.
 *
 * @export
 * @interface IOperate
 */
export interface IOperate {
    /**
     * operate name
     *
     * @type {TaskString}
     * @memberof IOperate
     */
    name?: TaskString;
    /**
     * operation
     *
     * enmu flags.
     * @type {Operation}
     * @memberof IOperate
     */
    oper?: Operation;
    /**
     * order index.
     *
     * @type {Order}
     * @memberof IOperate
     */
    order?: Order;

    /**
     * none pipe addation.
     *
     * @type {boolean}
     * @memberof IOperate
     */
    nonePipe?: boolean;

    /**
     * none output.
     *
     * @type {boolean}
     * @memberof IOperate
     */
    noneOutput?: boolean;
}

/**
 * task decorator info.
 *
 * @export
 * @interface ITaskDecorator
 * @extends {IOperate}
 */
export interface ITaskDecorator extends IOperate {
    /**
     * assert tasks. assert group name or extends name.
     *
     * @type {Src}
     * @memberof ITaskInfo
     */
    group?: Src;

    /**
     * custom jduge info match to another.
     *
     * @param {ITaskDecorator} another
     *
     * @memberof ITaskInfo
     */
    match?(another: ITaskDecorator);
}

/**
 * task decorator data.
 *
 * @export
 * @interface ITaskInfo
 * @extends {ITaskDecorator}
 */
export interface ITaskInfo extends ITaskDecorator {
    /**
     * finally task name.
     *
     * @type {Src}
     * @memberof ITaskInfo
     */
    taskName?: Src;

    /**
     * assert dist info.
     *
     * @type {IAssertDist}
     * @memberof ITaskInfo
     */
    assert?: IAssertDist
}

/**
 * task interface.
 *
 * @export
 * @interface ITask
 */
export interface ITask {
    /**
     * old filed.
     *
     * @type {ITaskInfo}
     * @memberof ITask
     */
    getInfo(): ITaskInfo;

    /**
     * set task info.
     *
     * @param {ITaskInfo} info
     *
     * @memberof ITask
     */
    setInfo?(info: ITaskInfo);
    /**
     * setup task.
     *
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     *
     * @memberof ITask
     */
    setup(context: ITaskContext, gulp?: Gulp): TaskResult;
}


export type TaskResult = Src | void;

/**
 * task source
 */
export type TaskSource = Src | ((ctx?: ITaskContext) => Src);

/**
 * task string
 */
export type TaskString = string | ((ctx?: ITaskContext) => string);

/**
 * async task source.
 */
export type AsyncTaskSource = TaskSource | ((ctx?: ITaskContext) => Promise<Src>);

/**
 * transform interface.
 *
 * @export
 * @interface ITransform
 * @extends {NodeJS.ReadWriteStream}
 */
export interface ITransform extends IOperate, NodeJS.ReadWriteStream {
    /**
     * custom set ITransform after pipe out.
     *
     * @param {ITransform} ouputStream
     * @returns {ITransform}
     *
     * @memberof ITransform
     */
    transformPipe?(ouputStream: ITransform): ITransform;

    /**
     * custom transform from source stream pipe in.
     *
     * @param {ITransform} sourceStream
     * @returns {ITransform}
     *
     * @memberof ITransform
     */
    transformSourcePipe?(sourceStream: ITransform): ITransform;

    // /**
    //  * transform pipe
    //  *
    //  * @param {NodeJS.ReadWriteStream} stream
    //  * @returns {ITransform}
    //  *
    //  * @memberof ITransform
    //  */
    // pipe(stream: NodeJS.ReadWriteStream): ITransform;
}

/**
 * transform source.
 */
export type TransformSource = ITransform | ITransform[];
/**
 * output transform.
 *
 * @export
 * @interface IOutput
 * @extends {ITransform}
 */
export interface IOutput extends ITransform {
    // dts?: ITransform;
    // js?: ITransform
}


/**
 * pipe work
 *
 * @export
 * @interface IPipe
 */
export interface IPipe extends IOperate {
    /**
     * transform to pipe work
     *
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @returns {(ITransform | Promise<ITransform>)}
     *
     * @memberof IPipe
     */
    toTransform?(context: ITaskContext, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}

export type Pipe = IPipe | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);



/**
 * output pipe
 *
 * @export
 * @interface IOutputPipe
 */
export interface IOutputPipe extends IOperate {
    /**
     * output pipes
     *
     * @param {ITransform} stream
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @returns {(ITransform | Promise<ITransform>)}
     *
     * @memberof IOutputPipe
     */
    toTransform?(stream: ITransform, context: ITaskContext, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}

export type OutputPipe = IOutputPipe | ((stream: ITransform, ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);


/**
 * assert dist.
 *
 * @export
 * @interface IAssertDist
 * @extends {IOperate}
 */
export interface IAssertDist {
    /**
     * assert name
     *
     * @type {TaskString}
     * @memberof IOperate
     */
    name?: TaskString;

    /**
     * the src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    src?: TaskSource;

    /**
     * the e2e src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    e2eSrc?: TaskSource;

    /**
     * the test src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    testSrc?: TaskSource

    /**
     * clean special source in 'dist'. if not setting, default clean 'dist' folder.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    cleanSrc?: TaskSource;

    /**
     * auto create task to watch this source.
     *
     * @type {(boolean | Array<string | WatchCallback>)}
     * @memberof IAssertDist
     */
    watch?: boolean | Array<string | WatchCallback>;

    /**
     * the watch src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    watchSrc?: TaskSource;
    /**
     * default output folder. if empty use parent setting, or ues 'dist'.
     */
    dist?: TaskString;
    /**
     * build output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    buildDist?: TaskString;
    /**
     * test output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    testDist?: TaskString;
    /**
     * e2e output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    e2eDist?: TaskString;
    /**
     * release output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    releaseDist?: TaskString;
    /**
     * deploy output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    deployDist?: TaskString;
}


/**
 * custom pipe.
 *
 * @export
 * @interface ICustomPipe
 */
export interface ICustomPipe {
    /**
     * custom stream pipe.
     *
     * @param {ITransform} gulpsrc
     * @param {ITaskContext} context
     * @param {IAssertDist} [dist]
     * @param {Gulp} [gulp]
     * @param {TaskCallback} [callback]
     * @returns {(ITransform | Promise<ITransform> | void)}
     *
     * @memberof ICustomPipe
    * */
    pipe?(gulpsrc: ITransform, context: ITaskContext, dist?: IAssertDist, gulp?: Gulp, callback?: TaskCallback): ITransform | Promise<ITransform> | void;

}

/**
 * pipe works.
 *
 * @export
 * @interface IPipeOption
 * @extends {ICustomPipe}
 */
export interface IPipeOption extends ICustomPipe {
    /**
     * task source stream config.
     *
     * @memberof IPipeOption
     */
    source?: TransformSource | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => TransformSource)
    /**
     * task pipe works.
     *
     * @memberof IDynamicTaskOption
     */
    pipes?: Pipe[] | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => Pipe[]);

    /**
     * output pipe task
     *
     * @memberof IPipeOption
     */
    output?: IOutputPipe[] | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => IOutputPipe[]);
}



/**
 * dynamic gulp task.
 *
 * @export
 * @interface IDynamicTaskOption
 * @extends {IAssertDist}
 */
export interface IDynamicTaskOption extends IAssertDist, IPipeOption, ICustomPipe, ITaskInfo, IOperate {
    /**
     * IAsserts extends name. for register dynamic task.
     *
     * @type {TaskName}
     * @memberof IAsserts
     */
    name: TaskString;
    /**
     * watch tasks
     *
     * @memberof IDynamicTaskOption
     */
    watchTasks?: Array<string | WatchCallback> | ((ctx?: ITaskContext, dt?: IDynamicTaskOption) => Array<string | WatchCallback>);
    /**
     * watch changed.
     *
     * @param {WatchEvent} event
     * @param {ITaskContext} context
     *
     * @memberof IDynamicTaskOption
     */
    watchChanged?(event: WatchEvent, context: ITaskContext);

    /**
     * custom task.
     *
     * @param {ITaskContext} context
     * @param {IDynamicTaskOption} [dt]
     * @param {Gulp} [gulp]
     * @returns {(void | ITransform | Promise<any>)}
     *
     * @memberof IDynamicTaskOption
     */
    task?(context: ITaskContext, dt?: IDynamicTaskOption, gulp?: Gulp): void | ITransform | Promise<any>;

    /**
     *  shell command task.
     *
     * @type {AsyncTaskSource}
     * @memberof IDynamicTaskOption
     */
    shell?: AsyncTaskSource
}

/**
 * dynamic tasks
 *
 * @export
 * @interface ITasks
 */
export interface IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}


/**
 * IAsserts to be dealt with.
 *
 * @export
 * @interface IAsserts
 * @extends {IAssertDist}
 */
export interface IAsserts extends IAssertDist, IPipeOption, ICustomPipe {

    /**
     * asser operation.
     *
     * @type {Operation}@memberof IAsserts
     */
    oper?: Operation;

    /**
     * current assert order.
     */
    order?: Order;

    /**
     * curr node run sequence with children context. default before children run.
     *
     * @type {NodeSequence}@memberof IAsserts
     */
    nodeSequence?: NodeSequence;

    /**
     * the shell command run way. default parallel.
     *
     * @type {RunWay}
     * @memberof IAsserts
     */
    shellRunWay?: RunWay;

    /**
     * set default task name. if current context task has no name.
     *
     * @type {TaskString}
     * @memberof IAsserts
     */
    defaultTaskName?: TaskString;

    /**
     * task runway  in this context.
     *
     * @type {RunWay}@memberof IAsserts
     */
    runWay?: RunWay;
    /**
     * custom control how to match tasks.
     *
     * @param {ITaskInfo} task
     * @param {ITaskInfo} match
     * @returns {boolean}
     *
     * @memberof IAsserts
     */
    match?(task: ITaskInfo, match: ITaskInfo): boolean;
}

export type folderCallback = (folder: string, folderName?: string, ctx?: ITaskContext) => string;

/**
 * custom modules task load define.
 *
 * @export
 * @interface ITaskDefine
 */
export interface ITaskDefine {
    /**
     * load config in modules
     *
     * @param {IAssertOption} option
     * @returns {ITaskContext}
     *
     * @memberof ITaskDefine
     */
    loadConfig?(option: IAssertOption, env: IEnvOption): ITaskConfig

    /**
     * load task in modules.
     *
     * @param {ITaskContext} context
     * @param {tasksInModule} findInModule
     * @param {tasksInDir} findInDir
     * @returns {Task[]}
     *
     * @memberof ITaskDefine
     */
    loadTasks?(context: ITaskContext): Promise<ITask[]>;


    /**
     * get tasks in module.
     *
     * @param {ITaskContext} context
     * @returns {Promise<ITask[]>}
     *
     * @memberof IContextDefine
     */
    tasks?(context: ITaskContext): Promise<ITask[]>;
}

/**
 * task context define.
 *
 * @export
 * @interface IContextDefine
 */
export interface IContextDefine extends ITaskDefine {
    /**
     * get context of tasks module.
     *
     * @param {ITaskConfig} config
     * @returns {ITaskContext}
     *
     * @memberof IContextDefine
     */
    getContext?(config: ITaskConfig): ITaskContext;


    /**
     * set context.
     *
     * @param {ITaskContext} config;
     * @memberof IContextDefine
     */
    setContext?(config: ITaskContext): void;

}


/**
 * assert option
 *
 * @export
 * @interface IAssertOption
 * @extends {IAsserts}
 */
export interface IAssertOption extends IAsserts {

    /**
     * asserts tasks run way. default RunWay.parallel
     *
     * @type {RunWay}
     * @memberOf IAssertOption
     */
    assertsRunWay?: RunWay;

    /**
     * tasks to deal with IAsserts.
     *
     * @type {IMap<Operation | Src | IAsserts | IDynamicTaskOption[]>}
     * @memberOf IAsserts
     */
    asserts?: IMap<Operation | Src | IAsserts | IDynamicTaskOption[]>;

    /**
     * set sub asserts task order in this task sequence.
     *
     * @type {Order}
     * @memberOf IAsserts
     */
    assertsOrder?: Order;
}
/**
 * task config. runtime task config for setup task.
 *
 * @export
 * @interface ITaskConfig
 */
export interface ITaskConfig {
    /**
     * custom global data cache.
     */
    globals?: any;
    /**
     * env
     *
     * @type {EnvOption}
     * @memberof ITaskConfig
     */
    env?: IEnvOption;

    /**
     * Operation
     *
     * @type {Operation}
     * @memberof ITaskConfig
     */
    oper?: Operation;
    /**
     * task option setting.
     *
     * @type {IAsserts}
     * @memberof ITaskConfig
     */
    option?: IAssertOption;

    /**
     * add task result to task sequence. default implement in bindingConfig.
     *
     * @param {Src[]} sequence  task sequence.
     * @param {ITaskInfo} task
     * @returns {Src[]}
     *
     * @memberof ITaskConfig
     */
    addToSequence?(sequence: Src[], task: ITaskInfo): Src[];

    /**
     * custom config run tasks sequence in.
     *
     * @param {Src[]} [tasks]
     * @param {ITaskInfo} [assertTasks]
     * @param {ITaskInfo} [subGroupTask]
     * @returns {Src[]}
     *
     * @memberof ITaskContext
     */
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];

    /**
     * custom print help.
     *
     * @param {string} lang
     *
     * @memberof ITaskContext
     */
    printHelp?(lang: string): void;

    /**
     * package filename.
     *
     * @type {string}
     * @memberof ITaskConfig
     */
    packageFile?: string;
    /**
     * custom context factory.
     *
     * @param {ITaskConfig} cfg
     * @param {ITaskContext} [parent]
     * @returns {ITaskContext}
     *
     * @memberof ITaskConfig
     */
    createContext?(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;

}

/**
 * express.
 *
 * @export
 * @interface Express
 * @template T
 * @template TResult
 */
export interface Express<T, TResult> {
    (item: T): TResult
}

/**
 * Builder for task context
 *
 * @export
 * @interface Builder
 */
export interface Builder {
    /**
     * build context component.
     *
     * @template T
     * @param {ITaskContext} node
     * @param {T} [option]
     * @returns {ITaskContext}
     * @memberof Builder
     */
    build<T extends IAsserts>(node: ITaskContext, option?: T): ITaskContext | Promise<ITaskContext>;

    /**
     * the context is built or not.
     *
     * @param {ITaskContext} node
     * @returns {boolean}
     * @memberof Builder
     */
    isBuilt(node: ITaskContext): boolean;

}


/**
 * runtime task context.
 *
 * @export
 * @interface ITaskContext
 */
export interface ITaskContext {

    /**
     * env.
     *
     * @type {IEnvOption}@memberof ITaskContext
     */
    env: IEnvOption;

    /**
     * task option setting.
     *
     * @type {IAsserts}@memberof ITaskContext
     */
    option: IAsserts;

    /**
     * parent context.
     *
     * @type {ITaskContext}
     * @memberof ITaskContext
     */
    parent?: ITaskContext;

    /**
     * run operation
     *
     * @type {Operation}
     * @memberof ITaskContext
     */
    oper: Operation;

    /**
     * the gulp instance.
     *
     * @type {Gulp}
     * @memberof ITaskContext
     */
    gulp: Gulp;

    /**
     * globals data.
     *
     * @type {*}@memberof ITaskContext
     */
    globals: any;

    /**
     * builder of context.
     *
     * @memberof ITaskContext
     */
    builder: Builder;



    /**
     * add sub ITaskContext
     *
     * @param {(ITaskContext | ITaskConfig | IAssertOption)} context
     * @returns {ITaskContext} sub context
     * @memberof ITaskContext
     */
    add(context: ITaskContext | ITaskConfig | IAssertOption): ITaskContext;
    /**
     * remove sub ITaskContext.
     *
     * @param {ITaskContext} [context]
     * @returns {ITaskContext[]}
     *
     * @memberof ITaskContext
     */
    remove(context?: ITaskContext): ITaskContext[];


    /**
     * set task config.
     *
     * @param {ITaskConfig} config;
     *
     * @memberof ITaskContext
     */
    setConfig(config: ITaskConfig);

    /**
     * get the task config.
     *
     * @returns {ITaskConfig}
     *
     * @memberof ITaskContext
     */
    getConfig(): ITaskConfig;


    /**
     * is task class.
     *
     * @param {*} obj
     * @returns {boolean}
     * @memberof ITaskContext
     */
    isTask(obj: any): boolean;

    /**
     * find sub context via express.
     *
     * @template T
     * @param {(T | Express<T, boolean>)} express
     * @param {Mode} [mode]
     * @returns {T}
     * @memberof ITaskContext
     */
    find<T extends ITaskContext>(express: T | Express<T, boolean>, mode?: Mode): T

    /**
     * filter<T extends ITaskContext>(express: Express<ITaskContext, void | boolean>, mode?: Mode): T[]
     *
     * @template T
     * @param {(Express<T, void | boolean>)} express
     * @param {Mode} [mode]
     * @returns {T[]}
     * @memberof ITaskContext
     */
    filter<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode): T[]

    /**
     * iteration context with express.
     *
     * @template T
     * @param {(Express<T, void | boolean>)} express
     * @param {Mode} [mode]
     * @memberof ITaskContext
     */
    each<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode);

    /**
     * map context.
     *
     * @template T
     * @param {Express<ITaskContext, T>} express
     * @param {Mode} [mode]
     * @param {Express<ITaskContext, boolean>} [filter]
     * @returns {T[]}
     *
     * @memberof ITaskContext
     */
    map<T>(express: Express<ITaskContext, T>, mode?: Mode, filter?: Express<ITaskContext, boolean>): T[]


    /**
     * do express work in routing.
     *
     * @param {(Express<ITaskContext, void | boolean>)} express
     * @memberof ITaskContext
     */
    route(express: Express<ITaskContext, void | boolean>);


    /**
     * translate all sub context to do express work.
     *
     * @param {(Express<ITaskContext, void | boolean>)} express
     * @memberof ITaskContext
     */
    trans(express: Express<ITaskContext, void | boolean>);

    /**
     * custom task match filter
     *
     * @param {ITaskInfo} task
     * @param {ITaskInfo} match
     * @returns {boolean}
     *
     * @memberof ITaskContext
     */
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;

    /**
     * get Src of current state.   default implement in bindingConfig.
     *
     * @param {ITaskInfo} [task]
     * @param {boolean} [relative] get relative path or absolute path.
     * @returns {Src}
     *
     * @memberof ITaskContext
     */
    getSrc(task?: ITaskInfo, relative?: boolean): Src;

    /**
     * get dist of current state.  default implement in bindingConfig.
     *
     * @param {ITaskInfo} [task]
     * @param {boolean} [relative] get relative path or absolute path.
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    getDist(task?: ITaskInfo, relative?: boolean): string;


    /**
     * generate task name. use taskName instead.
     *
     * @param {(TaskString | ITaskInfo)} task
     * @param {string} [ext]
     * @returns {string}
     * @memberof ITaskContext
     */
    subTaskName(task: TaskString | ITaskInfo, ext?: string): string;


    /**
     * generate task name. default implement in bindingConfig.
     *
     * @param {(TaskString | ITaskInfo)} task
     * @param {string} [ext]
     * @returns {string}
     * @memberof ITaskContext
     */
    taskName(task: TaskString | ITaskInfo, ext?: string): string;

    /**
     * get run sequence, after setup.
     *
     * @returns {Src[]}
     * @memberof ITaskContext
     */
    getRunSequence(): Src[];
    /**
     * load tasks.
     *
     * @returns {Promise<Src[]>}
     *
     * @memberof IContext
     */
    setup(): Promise<Src[]>;

    /**
     * load tasks of current context.
     *
     * @returns {(Src[] | Promise<Src[]>)}
     * @memberof ITaskContext
     */
    load(): Src[] | Promise<Src[]>;

    /**
     * add task for this context.
     *
     * @param {...ITask[]} task
     * @memberof ITaskContext
     */
    addTask(...task: ITask[]): void;

    /**
     * remove task
     *
     * @param {ITask} task
     * @returns {(ITask[] | Promise<ITask[]>)}
     * @memberof ITaskContext
     */
    removeTask(task: ITask): ITask[] | Promise<ITask[]>;

    /**
     * run task in this context.
     *
     * @returns {Promise<any>}
     *
     * @memberof IContext
     */
    run(): Promise<any>;


    /**
     * help tipe.
     *
     * @memberof ITaskContext
     */
    help();

    /**
     * find  task in module. default implement in bindingConfig.
     *
     * @param {(string | Object)} module
     * @param {ITaskInfo} [match]
     * @returns {Promise<ITask[]>}
     *
     * @memberof ITaskContext
     */
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;

    /**
     * find  task in directories. default implement in bindingConfig.
     *
     * @param {TaskSource} dirs
     * @param {ITaskInfo} [match]
     * @returns {Promise<ITask[]>}
     *
     * @memberof ITaskContext
     */
    findTasksInDir(dirs: TaskSource, match?: ITaskInfo): Promise<ITask[]>;

    /**
     * find taskdefine in module. default implement in bindingConfig.
     *
     * @param {(string | Object)} module
     * @returns {Promise<ITaskDefine>}
     *
     * @memberof ITaskContext
     */
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    /**
     * find taskdefine in directories.  default implement in bindingConfig.
     *
     * @param {TaskSource} dirs
     * @returns {Promise<ITaskDefine>}
     *
     * @memberof ITaskContext
     */
    findTaskDefineInDir(dirs: TaskSource): Promise<ITaskDefine>

    /**
     * filter file in directory.  default implement in bindingConfig.
     *
     * @param {Src} express
     * @param {(fileName: string) => boolean} [filter]
     * @param {(filename: string) => string} [mapping]
     * @returns {Promise<string[]>}
     *
     * @memberof ITaskContext
     */
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;

    /**
     * to task sequence.
     *
     * @param {ITask[]} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {Src[]}
     *
     * @memberof ITaskContext
     */
    toSequence(tasks: ITask[], zipName?: ZipTaskName): Src[];

    /**
     * filter file in directory.  default implement in bindingConfig.
     *
     * @param {Src[]} tasks
     * @returns {Promise<any>}
     *
     * @memberof ITaskContext
     */
    runSequence(tasks: Src[]): Promise<any>;

    /**
     * run task sequence.
     *
     * @param {(ITask[] | Promise<ITask[]>)} tasks
     * @param {ZipTaskName} [zipName]
     * @returns {Promise<any>}
     *
     * @memberof ITaskContext
     */
    runTaskSequence(tasks: ITask[] | Promise<ITask[]>, zipName?: ZipTaskName): Promise<any>;

    /**
     * dynamic generate tasks.  default implement in bindingConfig.
     *
     * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
     * @param {ITaskInfo} [match]
     * @returns {ITask[]}
     *
     * @memberof ITaskContext
     */
    generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];

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
     * add task result to task sequence. default implement in bindingConfig.
     *
     * @param {Src[]} sequence  task sequence.
     * @param {ITaskInfo} task
     * @returns {Src[]}
     *
     * @memberof ITaskContext
     */
    addToSequence(sequence: Src[], task: ITaskInfo): Src[];

    /**
     * get development root.
     *
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    getRootPath(): string;
    /**
     * get root folders.
     *
     * @param {folderCallback} [express]
     * @returns {string[]}
     *
     * @memberof ITaskContext
     */
    getRootFolders(express?: folderCallback): string[];
    /**
     * get folders in path.
     *
     * @param {string} pathstr
     * @param {folderCallback} [express]
     * @returns {string[]}
     *
     * @memberof ITaskContext
     */
    getFolders(pathstr: string, express?: folderCallback): string[];
    /**
     * get context dist folders
     *
     * @param {folderCallback} [express]
     * @param {ITaskInfo} [task]
     * @returns {string[]}
     *
     * @memberof ITaskContext
     */
    getDistFolders(express?: folderCallback, task?: ITaskInfo): string[];
    /**
     * join src to absolute path src with root( env.root ).
     *
     * @param {Src} src
     * @returns {Src}
     *
     * @memberof ITaskContext
     */
    toRootSrc(src: Src): Src

    /**
     * join pathstr to absolute path src with root( env.root ).
     *
     * @param {string} pathstr
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    toRootPath(pathstr: string): string;

    /**
     * join src to absolute path src with context dist root.
     *
     * @param {Src} src
     * @param {ITaskInfo} [task]
     * @returns {Src}
     *
     * @memberof ITaskContext
     */
    toDistSrc(src: Src, task?: ITaskInfo): Src;

    /**
     * join pathstr to absolute path src with dist root.
     *
     * @param {string} pathstr
     * @param {ITaskInfo} [task]
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    toDistPath(pathstr: string, task?: ITaskInfo): string;

    /**
     * parse to T type;
     *
     * @template T
     * @param {(T | ((ctx: ITaskContext) => T))} setting
     * @returns {T}
     *
     * @memberof ITaskContext
     */
    to<T>(setting: T | ((ctx: ITaskContext) => T)): T;
    /**
     * to src
     *
     * @param {any} TaskSource
     * @returns {Src}
     *
     * @memberof ITaskContext
     */
    toSrc(source: TaskSource): Src;

    /**
     * to string.
     *
     * @param {TaskString} name
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    toStr(name: TaskString): string;

    /**
     * to relative url.
     *
     * @param {string} basePath
     * @param {string} [toPath]
     * @returns {string}
     *
     * @memberof ITaskContext
     */
    toUrl(basePath: string, toPath?: string): string

    /**
     * get package config. default root path file 'package.json'
     *
     * @param {TaskString} [filename]
     * @returns {*}
     *
     * @memberof ITaskContext
     */
    getPackage(filename?: TaskString): any;


    /**
     * find and filter tasks in this context.
     *
     * @param {(item: ITask) => boolean} [express]
     * @returns {ITask[]}
     *
     * @memberof ITaskContext
     */
    tasks(express?: (item: ITask) => boolean): ITask[];

    /**
     * filter registered tasks in this context and sub context.
     *
     * @param {(item: ITask) => boolean} [express]
     * @returns {ITask[]}
     */
    registerTasks?(express?: (item: ITask) => boolean): ITask[];

    /**
     * get all global tasks registered in gulp.
     *
     * @returns {string[]}
     *
     * @memberof ITaskContext
     */
    globalTasks(): string[];
}

/**
 * event option
 *
 * @export
 * @interface IEnvOption
 */
export interface IEnvOption {
    /**
     * project root.
     *
     * @type {string}
     * @memberof IEnvOption
     */
    root?: string;
    /**
     * help doc
     *
     * @type {(boolean | string)}
     * @memberof IEnvOption
     */
    help?: boolean | string;
    test?: boolean | string;
    serve?: boolean | string;
    e2e?: boolean | string;
    release?: boolean;
    deploy?: boolean;
    watch?: boolean | string;
    /**
     * run spruce task.
     */
    task?: string;

    /**
     * project config setting.
     *
     * @type {string}
     * @memberof IEnvOption
     */
    config?: string;

    // key?: number;
    // value?: number;
    // csv?: string;
    // dist?: string;
    // lang?: string;

    publish?: boolean | string;

    /**
     * task group.
     *
     * @type {Src}
     * @memberof IEnvOption
     */
    group?: Src;

    /**
     * group bundle.
     *
     * @type {Src}
     * @memberof IEnvOption
     */
    gb?: Src;
}
