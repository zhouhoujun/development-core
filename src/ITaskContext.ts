import { IEnvOption } from './IEnvOption';
import { IAsserts } from './IAsserts';
import { Operation } from './Operation';
import { Gulp } from 'gulp';
import { Builder } from './Builder';
import { ITaskConfig } from './TaskConfig';
import { IAssertOption } from './IAssertOption';
import { Express } from './utils/Express';
import { Mode } from './Mode';
import { ITaskInfo, ITask } from './ITask';
import { Src, TaskString, TaskSource, ZipTaskName, folderCallback, CtxType } from './types';
import { IDynamicTaskOption } from './IDynamicTaskOption';
import { ExecOptions, ExecFileOptions } from 'child_process';
import { ITaskDefine } from './ITaskDefine';


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
     * run dynamic task. not register as global.
     *
     * @param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
     * @param {ITaskInfo} [match]
     * @returns {Promise<any>}
     * @memberof ITaskContext
     */
    runDynamic(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): Promise<any>;

    /**
     * execute shell.
     *
     * @param {string} cmd
     * @param {ExecOptions} [options]
     * @param {boolean} [allowError]
     * @returns {Promise<any>}
     * @memberof ITaskContext
     */
    execShell(cmd: string, options?: ExecOptions, allowError?: boolean): Promise<any>;

    /**
     * execute file.
     *
     * @param {string} cmd
     * @param {string[]} [args]
     * @param {ExecFileOptions} [options]
     * @param {boolean} [allowError]
     * @returns {Promise<any>}
     * @memberof ITaskContext
     */
    execFile(cmd: string, args?: string[], options?: ExecFileOptions, allowError?: boolean): Promise<any>;

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
     * @param {CtxType<T>} val
     * @returns {T}
     *
     * @memberof ITaskContext
     */
    to<T>(val: CtxType<T>): T;
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
     * get package module version in npm node module.
     *
     * @param {string} name
     * @param {string} [packageFile]
     * @returns {string}
     * @memberof ITaskContext
     */
    getNpmModuleVersion(name: string, packageFile?: string): string;
    /**
     * has package module installed.
     *
     * @param {string} name
     * @param {string} [packageFile]
     * @returns {boolean}
     * @memberof ITaskContext
     */
    hasNpmModule(name: string, packageFile?: string): boolean;


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
