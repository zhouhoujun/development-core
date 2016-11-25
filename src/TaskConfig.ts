import { Gulp, WatchEvent, WatchCallback, TaskCallback } from 'gulp';


/**
 * mutil source stream pipe task run way.
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
     * @memberOf IOrder
     */
    value: number;
    runWay?: RunWay;
}


/**
 * Order type.
 */
export type Order = number | IOrder | ((total: number, ctx?: ITaskContext) => number | IOrder);

/**
 * src
 */
export type Src = string | string[];

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
     * @memberOf IOperate
     */
    name?: TaskString;
    /**
     * operation 
     * 
     * enmu flags. 
     * @type {Operation}
     * @memberOf IOperate
     */
    oper?: Operation;
    /**
     * order index.
     * 
     * @type {Order}
     * @memberOf IOperate
     */
    order?: Order;
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
     * @memberOf ITaskInfo
     */
    group?: Src;

    /**
     * custom jduge info match to another.
     * 
     * @param {ITaskDecorator} another
     * 
     * @memberOf ITaskInfo
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
     * @memberOf ITaskInfo
     */
    taskName?: Src;

    /**
     * assert dist info.
     * 
     * @type {IAssertDist}
     * @memberOf ITaskInfo
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
     * @memberOf ITask
     */
    getInfo(): ITaskInfo;

    /**
     * set task info.
     * 
     * @param {ITaskInfo} info
     * 
     * @memberOf ITask
     */
    setInfo?(info: ITaskInfo);
    /**
     * setup task.
     * 
     * @param {ITaskContext} context
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     * 
     * @memberOf ITask
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
     * @memberOf ITransform
     */
    transformPipe?(ouputStream: ITransform): ITransform;

    /**
     * custom transform from source stream pipe in.
     * 
     * @param {ITransform} sourceStream
     * @returns {ITransform}
     * 
     * @memberOf ITransform
     */
    transformSourcePipe?(sourceStream: ITransform): ITransform;
    /**
     * transform pipe
     * 
     * @param {NodeJS.ReadWriteStream} stream
     * @returns {ITransform}
     * 
     * @memberOf ITransform
     */
    pipe(stream: NodeJS.ReadWriteStream): ITransform;
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
     * @memberOf IPipe
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
     * @memberOf IOutputPipe
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
     * @memberOf IOperate
     */
    name?: TaskString;

    /**
     * the src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf IAssertDist
     */
    src?: TaskSource;

    /**
     * the e2e src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf IAssertDist
     */
    e2eSrc?: TaskSource;

    /**
     * the test src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf IAssertDist
     */
    testSrc?: TaskSource

    /**
     * clean special source in 'dist'. if not setting, default clean 'dist' folder.
     * 
     * @type {TaskSource}
     * @memberOf IAssertDist
     */
    cleanSrc?: TaskSource;

    /**
     * auto create task to watch this source.
     * 
     * @type {(boolean | Array<string | WatchCallback>)}
     * @memberOf IAssertDist
     */
    watch?: boolean | Array<string | WatchCallback>;

    /**
     * the watch src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf IAssertDist
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
     * @memberOf Dist
     */
    buildDist?: string;
    /**
     * test output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    testDist?: string;
    /**
     * e2e output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    e2eDist?: string;
    /**
     * release output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    releaseDist?: string;
    /**
     * deploy output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    deployDist?: string;
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
     * @memberOf ICustomPipe
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
     * 
     * @memberOf IPipeOption
     */
    source?: TransformSource | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => TransformSource)
    /**
     * task pipe works.
     * 
     * 
     * @memberOf IDynamicTaskOption
     */
    pipes?: Pipe[] | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => Pipe[]);

    /**
     * output pipe task
     *
     * 
     * @memberOf IPipeOption
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
     * @memberOf IAsserts
     */
    name: TaskString;
    /**
     * watch tasks
     * 
     * 
     * @memberOf IDynamicTaskOption
     */
    watchTasks?: Array<string | WatchCallback> | ((ctx?: ITaskContext, dt?: IDynamicTaskOption) => Array<string | WatchCallback>);
    /**
     * watch changed.
     * 
     * @param {WatchEvent} event
     * @param {ITaskContext} context
     * 
     * @memberOf IDynamicTaskOption
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
     * @memberOf IDynamicTaskOption
     */
    task?(context: ITaskContext, dt?: IDynamicTaskOption, gulp?: Gulp): void | ITransform | Promise<any>;

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
     * tasks to deal with IAsserts.
     * 
     * @type {IMap<Operation | Src | IAsserts | IDynamicTaskOption[]>}
     * @memberOf IAsserts
     */
    asserts?: IMap<Operation | Src | IAsserts | IDynamicTaskOption[]>;

    /**
     * set IAsserts task order in this task sequence.
     * 
     * @type {Order}
     * @memberOf IAsserts
     */
    assertsOrder?: Order;

    /**
     * custom control how to match tasks.
     * 
     * @param {ITaskInfo} task
     * @param {ITaskInfo} match
     * @returns {boolean}
     * 
     * @memberOf IAsserts
     */
    match?(task: ITaskInfo, match: ITaskInfo): boolean;
}



/**
 * custom modules task load define.
 * will be remove. use IContextDefine instead.
 * 
 * @export
 * @interface ITaskDefine
 */
export interface ITaskDefine {
    /**
     * load config in modules
     * 
     * @param {IAsserts} option
     * @returns {ITaskContext}
     * 
     * @memberOf ITaskDefine
     */
    loadConfig(option: IAsserts, env: IEnvOption): ITaskConfig

    /**
     * load task in modules.
     * 
     * @param {ITaskContext} context
     * @param {tasksInModule} findInModule
     * @param {tasksInDir} findInDir
     * @returns {Task[]}
     * 
     * @memberOf ITaskDefine
     */
    loadTasks?(context: ITaskContext): Promise<ITask[]>;
}

/**
 * task context define.
 * 
 * @export
 * @interface IContextDefine
 */
export interface IContextDefine {
    /**
     * get context of tasks module.
     * 
     * @param {ITaskConfig} config
     * @returns {ITaskContext}
     * 
     * @memberOf IContextDefine
     */
    getContext(config: ITaskConfig): ITaskContext;

    /**
     * get tasks in module.
     * 
     * @param {ITaskContext} context
     * @returns {Promise<ITask[]>}
     * 
     * @memberOf IContextDefine
     */
    tasks?(context: ITaskContext): Promise<ITask[]>;

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
     * @memberOf ITaskConfig
     */
    env: IEnvOption;
    /**
     * task option setting.
     * 
     * @type {IAsserts}
     * @memberOf ITaskConfig
     */
    option: IAsserts;

    /**
     * add task result to task sequence. default implement in bindingConfig.
     * 
     * @param {Src[]} sequence  task sequence.
     * @param {ITaskInfo} task
     * @returns {Src[]}
     * 
     * @memberOf ITaskConfig
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
     * @memberOf ITaskContext
     */
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];

    /**
     * custom print help.
     * 
     * @param {string} lang
     * 
     * @memberOf ITaskContext
     */
    printHelp?(lang: string): void;


    /**
     * custom context factory.
     * 
     * @param {ITaskConfig} cfg
     * @param {ITaskContext} [parent]
     * @returns {ITaskContext}
     * 
     * @memberOf ITaskConfig
     */
    createContext?(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;

}


/**
 * runtime task context.
 * 
 * @export
 * @interface ITaskContext
 */
export interface ITaskContext extends ITaskConfig {
    /**
     * parent context.
     * 
     * @type {ITaskContext}
     * @memberOf ITaskContext
     */
    parent?: ITaskContext;

    /**
     * run operation
     * 
     * @type {Operation}
     * @memberOf ITaskContext
     */
    oper: Operation;

    /**
     * custom task match filter
     * 
     * @param {ITaskInfo} task
     * @param {ITaskInfo} match
     * @returns {boolean}
     * 
     * @memberOf ITaskContext
     */
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;

    /**
     * get Src of current state.   default implement in bindingConfig.
     * 
     * @param {ITaskInfo} [task]
     * @param {boolean} [relative] get relative path or absolute path. 
     * @returns {Src}
     * 
     * @memberOf ITaskContext
     */
    getSrc(task?: ITaskInfo, relative?: boolean): Src;

    /**
     * get dist of current state.  default implement in bindingConfig.
     * 
     * @param {ITaskInfo} [task]
     * @param {boolean} [relative] get relative path or absolute path. 
     * @returns {string}
     * 
     * @memberOf ITaskContext
     */
    getDist(task?: ITaskInfo, relative?: boolean): string;

    /**
     * generate sub task name. default implement in bindingConfig.
     * 
     * @param {string | ITaskInfo} task
     * @param {string} [ext] ext name.
     * 
     * @memberOf ITaskContext
     */
    subTaskName(task: string | ITaskInfo, ext?: string);

    /**
     * custom print help.
     * 
     * @param {string} lang
     * 
     * @memberOf ITaskContext
     */
    printHelp(lang: string): void;

    /**
     * find  task in module. default implement in bindingConfig.
     * 
     * @param {(string | Object)} module
     * @param {ITaskInfo} [match]
     * @returns {Promise<ITask[]>}
     * 
     * @memberOf ITaskContext
     */
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;

    /**
     * find  task in directories. default implement in bindingConfig.
     * 
     * @param {Src} dirs
     * @param {ITaskInfo} [match]
     * @returns {Promise<ITask[]>}
     * 
     * @memberOf ITaskContext
     */
    findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]>;

    /**
     * find taskdefine in module. default implement in bindingConfig.
     * 
     * @param {(string | Object)} module
     * @returns {Promise<ITaskDefine>}
     * 
     * @memberOf ITaskContext
     */
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    /**
     * find taskdefine in directories.  default implement in bindingConfig.
     * 
     * @param {Src} dirs
     * @returns {Promise<ITaskDefine>}
     * 
     * @memberOf ITaskContext
     */
    findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>

    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {Src} express
     * @param {(fileName: string) => boolean} [filter]
     * @param {(filename: string) => string} [mapping]
     * @returns {Promise<string[]>}
     * 
     * @memberOf ITaskContext
     */
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {Gulp} gulp
     * @param {Src[]} tasks
     * @returns {Promise<any>}
     * 
     * @memberOf ITaskContext
     */
    runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;

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

    /**
     * join src to absolute path src with root( env.root ). 
     * 
     * @param {Src} src
     * @returns {Src}
     * 
     * @memberOf ITaskContext
     */
    toRootSrc(src: Src): Src

    /**
     * join pathstr to absolute path src with root( env.root ). 
     * 
     * @param {string} pathstr
     * @returns {string}
     * 
     * @memberOf ITaskContext
     */
    toRootPath(pathstr: string): string;

    /**
     * join pathstr to absolute path src with dist root. 
     * 
     * @param {string} pathstr
     * @returns {string}
     * 
     * @memberOf ITaskContext
     */
    toDistPath(pathstr: string): string;

    /**
     * to src
     * 
     * @param {any} TaskSource
     * @returns {Src}
     * 
     * @memberOf ITaskContext
     */
    toSrc(source: TaskSource): Src;

    /**
     * to string.
     * 
     * @param {TaskString} name
     * @returns {string}
     * 
     * @memberOf ITaskContext
     */
    toStr(name: TaskString): string;
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
     * @memberOf IEnvOption
     */
    root?: string;
    /**
     * help doc
     * 
     * @type {(boolean | string)}
     * @memberOf IEnvOption
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
     * @memberOf IEnvOption
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
     * @memberOf IEnvOption
     */
    group?: Src;

    /**
     * group bundle.
     * 
     * @type {Src}
     * @memberOf IEnvOption
     */
    gb?: Src;
}
