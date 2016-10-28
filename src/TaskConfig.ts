import { Gulp, WatchEvent, WatchCallback } from 'gulp';

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
    deploy = 1 << 4
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

/**
 * src
 */
export type Src = string | string[];

/**
 * task decorator data.
 * 
 * @export
 * @interface ITaskInfo
 */
export interface ITaskInfo {
    /**
     * operation 
     * 
     * enmu flags. 
     * @type {Operation}
     * @memberOf ITaskInfo
     */
    oper?: Operation;
    /**
     * task sequence index.
     * 
     * @type {number}
     * @memberOf ITaskInfo
     */
    order?: number;
    /**
     * name.
     * 
     * @type {Src}
     * @memberOf ITaskInfo
     */
    name?: Src;

    /**
     * is watch task or not.
     * 
     * @type {boolean}
     * @memberOf ITaskInfo
     */
    watch?: boolean;
}

export type TaskResult = Src | void;

export type TaskSource = Src | ((oper?: Operation) => Src);
export type TaskString = string | ((oper?: Operation) => string);

// function not support deforator.
// export type Task = (gulp: Gulp, config: ITaskConfig) => TaskSequence;
/**
 * task interface.
 * 
 * @export
 * @interface ITask
 */
export interface ITask {
    /**
     * decorator of task.
     * 
     * @type {ITaskInfo}
     * @memberOf ITask
     */
    decorator: ITaskInfo
    /**
     * setup task.
     * 
     * @param {ITaskConfig} config
     * @param {Gulp} [gulp]
     * @returns {TaskResult}
     * 
     * @memberOf ITask
     */
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}

/**
 * task loader option.
 * 
 * @export
 * @interface ILoaderOption
 */
export interface ILoaderOption {
    /**
     * loader type, default module.
     * 
     * @type {string}
     * @memberOf ILoaderOption
     */
    type?: string;
    /**
     * module name or url
     * 
     * @type {string | Object}
     * @memberOf ILoaderOption
     */
    module?: string | Object;

    /**
     * config module name or url.
     * 
     * @type {string | Object}
     * @memberOf ILoaderOption
     */
    configModule?: string | Object;

    /**
     * config module name or url.
     * 
     * @type {string | Object}
     * @memberOf ILoaderOption
     */
    taskModule?: string | Object;

    /**
     * task define.
     * 
     * @type {ITaskDefine}
     * @memberOf ILoaderOption
     */
    taskDefine?: ITaskDefine;

    /**
     * custom external judage the object is right task func.
     * 
     * @param {*} mdl
     * @param {string} name
     * @returns {boolean}
     * 
     * @memberOf ILoaderOption
     */
    isTaskFunc?(mdl: any): boolean;
    /**
     * custom external judage the object is right task define.
     * 
     * @param {*} mdl
     * @returns {boolean}
     * 
     * @memberOf ILoaderOption
     */
    isTaskDefine?(mdl: any): boolean;
}

/**
 * loader to load tasks from directory.
 * 
 * @export
 * @interface DirLoaderOption
 * @extends {ILoaderOption}
 */
export interface IDirLoaderOption extends ILoaderOption {
    /**
     * loader dir
     * 
     * @type {TaskSource}
     * @memberOf ILoaderOption
     */
    dir?: TaskSource
    /**
     * config in directory. 
     * 
     * @type {string}
     * @memberOf DirLoaderOption
     */
    dirConfigFile?: string;
}


/**
 * transform interface.
 * 
 * @export
 * @interface ITransform
 * @extends {NodeJS.ReadWriteStream}
 */
export interface ITransform extends NodeJS.ReadWriteStream {
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
 * output transform. support typescript output.
 * 
 * @export
 * @interface IOutput
 * @extends {ITransform}
 */
export interface IOutput extends ITransform {
    dts?: ITransform;
    js?: ITransform
}

export type Pipe = (config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;

export type OutputPipe = (map: IOutput, config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;

export interface IOutputDist {
    /**
     * the src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf IOutputDist
     */
    src?: TaskSource

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
    build?: string;
    /**
     * test output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    test?: string;
    /**
     * e2e output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    e2e?: string;
    /**
     * release output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    release?: string;
    /**
     * deploy output folder. if empty use parent setting, or ues 'dist'.
     * 
     * @type {string}
     * @memberOf Dist
     */
    deploy?: string;
}


/**
 * dynamic gulp task.
 * 
 * @export
 * @interface IDynamicTask
 * @extends {IOutputDist}
 */
export interface IDynamicTask extends IOutputDist {
    /**
     * task name
     * 
     * @type {TaskName}
     * @memberOf IDynamicTask
     */
    name: TaskString;
    /**
     * task order.
     * 
     * @type {number}
     * @memberOf IDynamicTask
     */
    order?: number;
    /**
     * task type. default for all Operation.
     * 
     * @type {Operation}
     * @memberOf IDynamicTask
     */
    oper?: Operation;

    /**
     * watch tasks
     * 
     * 
     * @memberOf IDynamicTask
     */
    watch?: Array<string | WatchCallback> | ((config?: ITaskConfig, dt?: IDynamicTask) => Array<string | WatchCallback>);
    /**
     * watch changed.
     * 
     * @param {WatchEvent} event
     * @param {ITaskConfig} config
     * 
     * @memberOf IDynamicTask
     */
    watchChanged?(event: WatchEvent, config: ITaskConfig);
    /**
     * stream pipe.
     * 
     * @param {ITransform} gulpsrc
     * @param {ITaskConfig} config
     * @returns {(ITransform | Promise<ITransform>)}
     * 
     * @memberOf IDynamicTask
     */
    pipe?(gulpsrc: ITransform, config: ITaskConfig, dt?: IDynamicTask): ITransform | Promise<ITransform>;

    /**
     * task pipe works.
     * 
     * 
     * @memberOf IDynamicTask
     */
    pipes?: Pipe[] | ((config?: ITaskConfig, dt?: IDynamicTask) => Pipe[]);

    /**
     * output pipe task
     *
     * 
     * @memberOf IDynamicTask
     */
    output?: OutputPipe[] | ((config?: ITaskConfig, dt?: IDynamicTask) => OutputPipe[]);

    /**
     * custom task.
     * 
     * @param {ITaskConfig} config
     * @param {IDynamicTask} [dt]
     * @param {Gulp} [gulp]
     * @returns {(void | ITransform | Promise<any>)}
     * 
     * @memberOf IDynamicTask
     */
    task?(config: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp): void | ITransform | Promise<any>;

}

/**
 * the option for loader dynamic build task.
 * 
 * @export
 * @interface IDynamicLoaderOption
 * @extends {ILoaderOption}
 */
export interface IDynamicLoaderOption extends ILoaderOption {
    /**
     * dynamic task
     * 
     * @type {(IDynamicTask | IDynamicTask[])}
     * @memberOf IDynamicLoaderOption
     */
    dynamicTasks?: IDynamicTask | IDynamicTask[];
}


/**
 * task loader option.
 * 
 * @export
 * @interface TaskLoaderOption
 */
export interface ITaskLoaderOption {
    /**
     * task loader
     * 
     * @type {(string | ILoaderOption | IDynamicTask | IDynamicTask[])}
     * @memberOf ITaskOption
     */
    loader?: string | ILoaderOption | IDynamicTask | IDynamicTask[];

    // /**
    //  * custom set run tasks sequence.
    //  * 
    //  * @param {Src[]} tasks
    //  * @param {ITaskInfo} [assertsTask]
    //  * @param {ITaskInfo} [subGroupTask]
    //  * @returns {Src[]}
    //  * 
    //  * @memberOf ITaskLoaderOption
    //  */
    // runTasks?(tasks: Src[], assertsTask?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];

}


export interface ISubTaskOption {
    /**
     * sub tasks.
     * 
     * @type {(ITaskOption | ITaskOption[])}
     * @memberOf ISubTaskOption
     */
    tasks?: ITaskOption | ITaskOption[];

    /**
     * set sub task order in this task sequence.
     * 
     * @type {number}
     * @memberOf ISubTaskOption
     */
    subTaskOrder?: number;

}


/**
 * IAsserts to be dealt with.
 * 
 * @export
 * @interface IAsserts
 * @extends {IOutputDist}
 */
export interface IAsserts extends IOutputDist, ITaskLoaderOption {
    /**
     * IAsserts extends name. for register dynamic task.
     * 
     * @type {TaskName}
     * @memberOf IAsserts
     */
    name?: TaskString;

    /**
     * tasks to deal with IAsserts.
     * 
     * @type {IMap<Src | IAsserts, IDynamicTask[]>}
     * @memberOf IAsserts
     */
    asserts?: IMap<Src | IAsserts | IDynamicTask[]>;

    /**
     * set IAsserts task order in this task sequence.
     * 
     * @type {number}
     * @memberOf IAsserts
     */
    assertsOrder?: number;
}


/**
 * task option setting.
 * 
 * @export
 * @interface ITaskOption
 * @extends {IAsserts}
 * @extends {ITaskLoaderOption}
 */
export interface ITaskOption extends IAsserts, ISubTaskOption {
    /**
     * task loader must setting.
     * 
     * @type {(string | ILoaderOption | IDynamicTask | IDynamicTask[])}
     * @memberOf ITaskOption
     */
    loader: string | ILoaderOption | IDynamicTask | IDynamicTask[];

    /**
     * the src file filter string. default 'src'.
     * 
     * @type {TaskSource}
     * @memberOf ITaskOption
     */
    src: TaskSource;
}

/**
 * modules task define
 * 
 * @export
 * @interface ITaskDefine
 */
export interface ITaskDefine {
    /**
     * load config in modules
     * 
     * @param {Operation} oper
     * @param {ITaskOption} option
     * @returns {ITaskConfig}
     * 
     * @memberOf ITaskDefine
     */
    loadConfig(oper: Operation, option: ITaskOption, env: IEnvOption): ITaskConfig

    /**
     * load task in modules.
     * 
     * @param {ITaskConfig} config
     * @param {tasksInModule} findInModule
     * @param {tasksInDir} findInDir
     * @returns {Task[]}
     * 
     * @memberOf ITaskDefine
     */
    loadTasks?(config: ITaskConfig): Promise<ITask[]>;
}

/**
 * run time task config for setup task.
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
     * run operation
     * 
     * @type {Operation}
     * @memberOf ITaskConfig
     */
    oper: Operation;
    /**
     * task option setting.
     * 
     * @type {IAsserts}
     * @memberOf ITaskConfig
     */
    option: IAsserts | ITaskOption;

    /**
     * get Src of current state.   default implement in bindingConfig.
     * 
     * @param {IAsserts} [assert]
     * @returns {Src}
     * 
     * @memberOf ITaskConfig
     */
    getSrc?(assert?: IAsserts): Src;

    /**
     * get dist of current state.  default implement in bindingConfig.
     * 
     * @param {IOutputDist} dist
     * @returns {string}
     * 
     * @memberOf ITaskConfig
     */
    getDist?(dist?: IOutputDist): string;

    /**
     * custom config run tasks sequence in.
     * 
     * @param {Src[]} [tasks]
     * @param {ITaskInfo} [assertTasks]
     * @param {ITaskInfo} [subGroupTask]
     * @returns {Src[]}
     * 
     * @memberOf ITaskConfig
     */
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo, ): Src[];
    /**
     * custom print help.
     * 
     * @param {string} lang
     * 
     * @memberOf ITaskConfig
     */
    printHelp?(lang: string): void;

    /**
     * find  task in module. default implement in bindingConfig.
     * 
     * @param {string | Object} module
     * @returns {Promise<ITask[]>}
     * 
     * @memberOf ITaskConfig
     */
    findTasks?(module: string | Object): Promise<ITask[]>;
    /**
     * find  task in directories. default implement in bindingConfig.
     * 
     * @param {Src} dirs
     * @returns {Promise<ITask[]>}
     * 
     * @memberOf ITaskConfig
     */
    findTasksInDir?(dirs: Src): Promise<ITask[]>;

    /**
     * find taskdefine in module. default implement in bindingConfig.
     * 
     * @param {(string | Object)} module
     * @returns {Promise<ITaskDefine>}
     * 
     * @memberOf ITaskConfig
     */
    findTaskDefine?(module: string | Object): Promise<ITaskDefine>;
    /**
     * find taskdefine in directories.  default implement in bindingConfig.
     * 
     * @param {Src} dirs
     * @returns {Promise<ITaskDefine>}
     * 
     * @memberOf ITaskConfig
     */
    findTaskDefineInDir?(dirs: Src): Promise<ITaskDefine>

    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {string} directory
     * @param {((fileName: string) => boolean)} [express]
     * @returns {string[]}
     * 
     * @memberOf ITaskConfig
     */
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {Gulp} gulp
     * @param {Src[]} tasks
     * @returns {Promise<any>}
     * 
     * @memberOf ITaskConfig
     */
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;

    /**
     * dynamic generate tasks.  default implement in bindingConfig.
     * 
     * @param {(IDynamicTask | IDynamicTask[])} tasks
     * @returns {Task[]}
     * 
     * @memberOf ITaskConfig
     */
    generateTask?(tasks: IDynamicTask | IDynamicTask[]): ITask[];

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
     * generate sub task name. default implement in bindingConfig.
     * 
     * @param {IAsserts | string} assert
     * @param {string} [defaultName]
     * 
     * @memberOf ITaskConfig
     */
    subTaskName?(assert: string | IAsserts, defaultName?: string);
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
     * group bundle.
     * 
     * @type {Src}
     * @memberOf IEnvOption
     */
    grp?: Src;
}
