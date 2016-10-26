import * as _ from 'lodash';
import { Gulp, WatchEvent, WatchCallback } from 'gulp';
import * as chalk from 'chalk';
import { readdirSync, lstatSync } from 'fs';

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
 * Task return type.
 * 
 * @export
 * @interface ITaskResult
 */
export interface ITaskResult {
    /**
     * task name for task sequence.
     * 
     * @type {Src}
     * @memberOf ITaskResult
     */
    name?: Src;
    /**
     * task Operation type. default all pperation.
     * 
     * @type {Operation}
     * @memberOf ITaskResult
     */
    oper?: Operation;
    /**
     * task sequence order.
     * 
     * @type {number}
     * @memberOf ITaskResult
     */
    order?: number;
}

export type TaskResult = Src | ITaskResult;
export type Task = (gulp: Gulp, config: TaskConfig) => TaskResult | TaskResult[] | void;

/**
 * task decorator annations.
 * 
 * @export
 * @param {Function} constructor
 */
export function task(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}
/**
 * task loader option.
 * 
 * @export
 * @interface LoaderOption
 */
export interface LoaderOption {
    /**
     * loader type, default module.
     * 
     * @type {string}
     * @memberOf LoaderOption
     */
    type?: string;
    /**
     * module name or url
     * 
     * @type {string | Object}
     * @memberOf LoaderOption
     */
    module?: string | Object;

    /**
     * config module name or url.
     * 
     * @type {string | Object}
     * @memberOf LoaderOption
     */
    configModule?: string | Object;

    /**
     * config module name or url.
     * 
     * @type {string | Object}
     * @memberOf LoaderOption
     */
    taskModule?: string | Object;

    /**
     * task define.
     * 
     * @type {ITaskDefine}
     * @memberOf LoaderOption
     */
    taskDefine?: ITaskDefine;

    /**
     * custom external judage the object is right task func.
     * 
     * @param {*} mdl
     * @param {string} name
     * @returns {boolean}
     * 
     * @memberOf LoaderOption
     */
    isTaskFunc?(mdl: any): boolean;
    /**
     * custom external judage the object is right task define.
     * 
     * @param {*} mdl
     * @returns {boolean}
     * 
     * @memberOf LoaderOption
     */
    isTaskDefine?(mdl: any): boolean;
}

/**
 * loader to load tasks from directory.
 * 
 * @export
 * @interface DirLoaderOption
 * @extends {LoaderOption}
 */
export interface DirLoaderOption extends LoaderOption {
    /**
     * loader dir
     * 
     * @type {Src}
     * @memberOf LoaderOption
     */
    dir?: Src;
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
 * @interface Output
 * @extends {ITransform}
 */
export interface Output extends ITransform {
    dts?: ITransform;
    js?: ITransform
}

export type Pipe = (config?: TaskConfig, dt?: DynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;

export type OutputPipe = (map: Output, config?: TaskConfig, dt?: DynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;

export interface OutputDist {
    /**
     * the src file filter string. default 'src'.
     * 
     * @type {string}
     * @memberOf OutputDist
     */
    src?: Src;

    /**
     * default output folder. if empty use parent setting, or ues 'dist'.
     */
    dist?: string;
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
 * @interface DynamicTask
 * @extends {OutputDist}
 */
export interface DynamicTask extends OutputDist {
    /**
     * task name
     * 
     * @type {string}
     * @memberOf DynamicTask
     */
    name: string;
    /**
     * task order.
     * 
     * @type {number}
     * @memberOf DynamicTask
     */
    order?: number;
    /**
     * task type. default for all Operation.
     * 
     * @type {Operation}
     * @memberOf DynamicTask
     */
    oper?: Operation;

    /**
     * watch tasks
     * 
     * 
     * @memberOf DynamicTask
     */
    watch?: Array<string | WatchCallback> | ((config?: TaskConfig, dt?: DynamicTask) => Array<string | WatchCallback>);
    /**
     * watch changed.
     * 
     * @param {WatchEvent} event
     * @param {TaskConfig} config
     * 
     * @memberOf DynamicTask
     */
    watchChanged?(event: WatchEvent, config: TaskConfig);
    /**
     * stream pipe.
     * 
     * @param {ITransform} gulpsrc
     * @param {TaskConfig} config
     * @returns {(ITransform | Promise<ITransform>)}
     * 
     * @memberOf DynamicTask
     */
    pipe?(gulpsrc: ITransform, config: TaskConfig, dt?: DynamicTask): ITransform | Promise<ITransform>;

    /**
     * task pipe works.
     * 
     * 
     * @memberOf DynamicTask
     */
    pipes?: Pipe[] | ((config?: TaskConfig, dt?: DynamicTask) => Pipe[]);

    /**
     * output pipe task
     *
     * 
     * @memberOf DynamicTask
     */
    output?: OutputPipe[] | ((config?: TaskConfig, dt?: DynamicTask) => OutputPipe[]);

    /**
     * custom task.
     * 
     * @param {TaskConfig} config
     * @param {DynamicTask} [dt]
     * @param {Gulp} [gulp]
     * @returns {(void | ITransform | Promise<any>)}
     * 
     * @memberOf DynamicTask
     */
    task?(config: TaskConfig, dt?: DynamicTask, gulp?: Gulp): void | ITransform | Promise<any>;

}

/**
 * the option for loader dynamic build task.
 * 
 * @export
 * @interface DynamicLoaderOption
 * @extends {LoaderOption}
 */
export interface DynamicLoaderOption extends LoaderOption {
    /**
     * dynamic task
     * 
     * @type {(DynamicTask | DynamicTask[])}
     * @memberOf DynamicLoaderOption
     */
    dynamicTasks?: DynamicTask | DynamicTask[];
}


/**
 * task loader option.
 * 
 * @export
 * @interface TaskLoaderOption
 */
export interface TaskLoaderOption {
    /**
     * task loader
     * 
     * @type {(string | LoaderOption | DynamicTask | DynamicTask[])}
     * @memberOf TaskOption
     */
    loader: string | LoaderOption | DynamicTask | DynamicTask[];

    /**
     * external task for 
     * 
     * @memberOf TaskConfig
     */
    externalTask?: Task;
    /**
     * custom set run tasks sequence.
     * 
     * 
     * @memberOf TaskConfig
     */
    runTasks?: Src[] | ((oper: Operation, tasks: Src[], subGroupTask?: TaskResult, assertsTask?: TaskResult) => Src[]);

    /**
     * sub tasks.
     * 
     * @type {(TaskOption | TaskOption[])}
     * @memberOf TaskOption
     */
    tasks?: TaskOption | TaskOption[];

    /**
     * set sub task order in this task sequence.
     * 
     * @type {number}
     * @memberOf TaskLoaderOption
     */
    subTaskOrder?: number;
}


/**
 * asserts to be dealt with.
 * 
 * @export
 * @interface Asserts
 */
export interface Asserts extends OutputDist, TaskLoaderOption {
    /**
     * asserts extends name. for register dynamic task.
     * 
     * @type {string}
     * @memberOf Asserts
     */
    name?: string;

    /**
     * tasks to deal with asserts.
     * 
     * @type {IMap<Src | Asserts, DynamicTask[]>}
     * @memberOf Asserts
     */
    asserts?: IMap<Src | Asserts | DynamicTask[]>;

    /**
     * set asserts task order in this task sequence.
     * 
     * @type {number}
     * @memberOf Asserts
     */
    assertsOrder?: number;
}


/**
 * task option setting.
 * 
 * @export
 * @interface TaskOption
 */
export interface TaskOption extends Asserts {
    /**
     * the src file filter string. default 'src'.
     * 
     * @type {string}
     * @memberOf TaskOption
     */
    src: Src;
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
     * @param {TaskOption} option
     * @returns {TaskConfig}
     * 
     * @memberOf ITaskDefine
     */
    moduleTaskConfig(oper: Operation, option: TaskOption, env: EnvOption): TaskConfig

    /**
     * load task in modules.
     * 
     * @param {TaskConfig} config
     * @param {tasksInModule} findInModule
     * @param {tasksInDir} findInDir
     * @returns {Task[]}
     * 
     * @memberOf ITaskDefine
     */
    moduleTaskLoader?(config: TaskConfig): Promise<Task[]>;
}

/**
 * run time task config for setup task.
 * 
 * @export
 * @interface TaskConfig
 */
export interface TaskConfig {
    /**
     * custom global data cache.
     */
    globals?: any;
    /**
     * env
     * 
     * @type {EnvOption}
     * @memberOf TaskConfig
     */
    env: EnvOption;
    /**
     * run operation
     * 
     * @type {Operation}
     * @memberOf TaskConfig
     */
    oper: Operation;
    /**
     * task option setting.
     * 
     * @type {TaskOption}
     * @memberOf TaskConfig
     */
    option: TaskOption;

    /**
     * custom config run tasks sequence in.
     * 
     * @param {TaskResult} [subGroupTask]
     * @param {Src[]} [tasks]
     * @param {TaskResult} [assertTasks]
     * @returns {Src[]}
     * 
     * @memberOf TaskConfig
     */
    runTasks?(subGroupTask?: TaskResult, tasks?: Src[], assertTasks?: TaskResult): Src[];
    /**
     * custom print help.
     * 
     * @param {string} lang
     * 
     * @memberOf TaskConfig
     */
    printHelp?(lang: string): void;

    /**
     * find  task in module. default implement by loader.
     * 
     * @param {string} module
     * @returns {Promise<Task[]>}
     * 
     * @memberOf TaskConfig
     */
    findTasksInModule?(module: string): Promise<Task[]>;
    /**
     * find  task in directories. default implement by loader.
     * 
     * @param {Src} dirs
     * @returns {Promise<Task[]>}
     * 
     * @memberOf TaskConfig
     */
    findTasksInDir?(dirs: Src): Promise<Task[]>;

    /**
     * get dist of current state.  default implement in bindingConfig.
     * 
     * @param {OutputDist} dist
     * @returns {string}
     * 
     * @memberOf TaskConfig
     */
    getDist?(dist?: OutputDist): string;
    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {string} directory
     * @param {((fileName: string) => boolean)} [express]
     * @returns {string[]}
     * 
     * @memberOf TaskConfig
     */
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    /**
     * filter file in directory.  default implement in bindingConfig.
     * 
     * @param {Gulp} gulp
     * @param {Src[]} tasks
     * @returns {Promise<any>}
     * 
     * @memberOf TaskConfig
     */
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;

    /**
     * dynamic generate tasks.  default implement in bindingConfig.
     * 
     * @param {(DynamicTask | DynamicTask[])} tasks
     * @returns {Task[]}
     * 
     * @memberOf TaskConfig
     */
    generateTask?(tasks: DynamicTask | DynamicTask[]): Task[];

    /**
     * add task result to task sequence.
     * 
     * @param {Src[]} sequence  task sequence.
     * @param {TaskResult} taskResult
     * @returns {Src[]}
     * 
     * @memberOf TaskConfig
     */
    addTask?(sequence: Src[], taskResult: TaskResult): Src[];
    /**
     * generate sub task name
     * 
     * @param {string} name
     * @param {string} [defaultName]
     * 
     * @memberOf TaskConfig
     */
    subTaskName?(name: string, defaultName?: string);
}

/**
 * event option
 * 
 * @export
 * @interface EnvOption
 */
export interface EnvOption {
    /**
     * project root.
     * 
     * @type {string}
     * @memberOf EnvOption
     */
    root?: string;
    /**
     * help doc
     * 
     * @type {(boolean | string)}
     * @memberOf EnvOption
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
     * @memberOf EnvOption
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
     * @memberOf EnvOption
     */
    grp?: Src;
}

/**
 * binding Config to implement default func.
 * 
 * @export
 * @param {TaskConfig} cfg
 * @returns {TaskConfig}
 */
export function bindingConfig(cfg: TaskConfig): TaskConfig {
    cfg.fileFilter = cfg.fileFilter || files;
    cfg.runSequence = cfg.runSequence || runSequence;
    cfg.addTask = cfg.addTask || addTask;
    cfg.generateTask = cfg.generateTask || ((tasks: DynamicTask | DynamicTask[]) => {
        return generateTask(tasks, cfg.oper, cfg.env);
    });
    cfg.subTaskName = cfg.subTaskName || ((name, deft = '') => {
        return cfg.option.name ? `${cfg.option.name}-${name || deft}` : name;
    });
    cfg.getDist = cfg.getDist || ((ds?: OutputDist) => {
        if (ds) {
            let dist = getCurrentDist(ds, cfg.oper);
            if (dist) {
                return dist;
            }
        }
        return getCurrentDist(cfg.option, cfg.oper);
    });

    return cfg;
}

/**
 * get current env Operation.
 * 
 * @export
 * @param {EnvOption} env
 * @returns
 */
export function currentOperation(env: EnvOption) {
    let oper: Operation;
    if (env.deploy) {
        oper = Operation.deploy;
    } else if (env.release) {
        oper = Operation.release;
    } else if (env.e2e) {
        oper = Operation.e2e;
    } else if (env.test) {
        oper = Operation.test;
    } else {
        oper = Operation.build;
    }

    return oper;
}


/**
 * convert setup task result to run sequence src.
 * 
 * @export
 * @param {(Array<TaskResult | TaskResult[] | void>)} tasks
 * @param {Operation} oper
 * @returns {Src[]}
 */
export function toSequence(tasks: Array<TaskResult | TaskResult[] | void>, oper: Operation): Src[] {
    let seq: Src[] = [];
    tasks = _.filter(tasks, it => it);
    let len = tasks.length;
    tasks = _.orderBy(tasks, t => {
        if (t) {
            if (_.isString(t)) {
                return len;
            } else if (_.isArray(t)) {
                return len;
            } else {
                return (<ITaskResult>t).order
            }
        }
        return len;
    });


    _.each(tasks, t => {
        if (!t) {
            return;
        }
        if (_.isString(t)) {
            seq.push(t);
        } else if (_.isArray(t)) {
            seq.push(_.flatten(toSequence(t, oper)));
        } else {
            if (t.name) {
                if (t.oper) {
                    if ((t.oper & oper) > 0) {
                        seq.push(t.name);
                    }
                } else {
                    seq.push(t.name);
                }
            }
        }
    });
    return seq;
}

/**
 * run task sequence.
 * 
 * @protected
 * @param {Gulp} gulp
 * @param {Src[]} tasks
 * @returns {Promise<any>}
 * 
 * @memberOf Development
 */
export function runSequence(gulp: Gulp, tasks: Src[]): Promise<any> {
    let ps = Promise.resolve();
    if (tasks && tasks.length > 0) {
        _.each(tasks, task => {
            ps = ps.then(() => {
                let taskErr = null, taskStop = null;
                return new Promise((reslove, reject) => {
                    let tskmap: any = {};
                    _.each(_.isArray(task) ? task : [task], t => {
                        tskmap[t] = false;
                    });
                    taskErr = (err) => {
                        reject(err);
                    };
                    taskStop = (e: any) => {
                        tskmap[e.task] = true;
                        if (!_.some(_.values(tskmap), it => !it)) {
                            reslove();
                        }
                    }
                    gulp.on('task_stop', taskStop)
                        .on('task_err', taskErr);
                    gulp.start(task);
                })
                    .then(() => {
                        if (gulp['removeListener']) {
                            gulp['removeListener']('task_stop', taskStop);
                            gulp['removeListener']('task_err', taskErr);
                        }
                    }, err => {
                        if (gulp['removeListener']) {
                            gulp['removeListener']('task_stop', taskStop);
                            gulp['removeListener']('task_err', taskErr);
                        }
                        console.error(err);
                    });
            });
        });
    }
    return ps;
}

/**
 * filter fileName in directory.
 * 
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export function files(directory: string, express?: ((fileName: string) => boolean)): string[] {
    let res: string[] = [];
    express = express || ((fn) => true);
    _.each(readdirSync(directory), fname => {
        let filePn = directory + '/' + fname;
        var fst = lstatSync(filePn);
        if (!fst.isDirectory()) {
            if (express(filePn)) {
                res.push(filePn)
            }
        } else {
            res = res.concat(files(filePn, express))
        }
    });
    return res;
}



/**
 * dynamic build tasks.
 * 
 * @export
 * @param {(DynamicTask | DynamicTask[])} tasks
 * @param {Operation} oper
 * @returns {Task[]}
 */
export function generateTask(tasks: DynamicTask | DynamicTask[], oper: Operation, env: EnvOption): Task[] {
    let taskseq: Task[] = [];
    _.each(_.isArray(tasks) ? tasks : [tasks], dt => {
        if (dt.oper && (dt.oper & oper) <= 0) {
            return;
        }
        if (dt.watch) {
            if (!env.watch) {
                return;
            }
            console.log('register watch  dynamic task:', chalk.cyan(dt.name));
            taskseq.push(createWatchTask(dt));
        } else if (_.isFunction(dt.task)) { // custom task
            console.log('register custom dynamic task:', chalk.cyan(dt.name));
            taskseq.push(createTask(dt));
        } else {
            console.log('register pipes  dynamic task:', chalk.cyan(dt.name));
            // pipe stream task.
            taskseq.push(createPipesTask(dt));
        }
    });

    return taskseq;
}



/**
 * get dist.
 * 
 * @param {OutputDist} ds
 * @param {Operation} oper
 * @returns
 */
function getCurrentDist(ds: OutputDist, oper: Operation) {
    let dist: string;
    switch (oper) {
        case Operation.build:
            dist = ds.build || ds.dist;
            break;
        case Operation.test:
            dist = ds.test || ds.build || ds.dist;
            break;
        case Operation.e2e:
            dist = ds.e2e || ds.build || ds.dist;
            break;
        case Operation.release:
            dist = ds.release || ds.dist;
            break;
        case Operation.deploy:
            dist = ds.deploy || ds.dist;
            break;
        default:
            dist = '';
            break;
    }
    return dist;
}

function addTask(taskSequence: Src[], rst: TaskResult) {
    if (!rst) {
        return taskSequence;
    }
    if (_.isString(rst) || _.isArray(rst)) {
        taskSequence.push(rst);
    } else if (rst.name) {
        if (_.isNumber(rst.order) && rst.order >= 0 && rst.order < taskSequence.length) {
            taskSequence.splice(rst.order, 0, rst.name);
            return taskSequence;
        }
        taskSequence.push(rst.name);
    }
    return taskSequence;
}


/**
 * promise task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createTask(dt: DynamicTask) {
    return (gulp: Gulp, cfg: TaskConfig): TaskResult => {
        let tk = cfg.subTaskName(dt.name);
        gulp.task(tk, () => {
            return dt.task(cfg, dt, gulp);
        });
        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk
    };
}
/**
 * create dynamic watch task.
 * 
 * @param {DynamicTask} dt
 * @returns
 */
function createWatchTask(dt: DynamicTask) {
    return (gulp: Gulp, cfg: TaskConfig): TaskResult => {
        let watchs = _.isFunction(dt.watch) ? dt.watch(cfg) : dt.watch;
        if (!_.isFunction(_.last(watchs))) {
            watchs.push(<WatchCallback>(event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, cfg);
            });
        }
        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return cfg.subTaskName(w);
            }
            return w;
        })
        let tk = cfg.subTaskName(dt.name);
        gulp.task(tk, () => {
            console.log('watch, src:', chalk.cyan.call(chalk, cfg.option.src));
            gulp.watch(cfg.option.src, watchs)
        });

        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk;
    };
}
function createPipesTask(dt: DynamicTask) {
    return (gulp: Gulp, cfg: TaskConfig): TaskResult => {

        let tk = cfg.subTaskName(dt.name);
        gulp.task(tk, () => {
            let src = Promise.resolve(gulp.src(dt.src || cfg.option.src));
            if (dt.pipes) {
                let pipes = _.isFunction(dt.pipes) ? dt.pipes(cfg, dt) : dt.pipes;
                _.each(pipes, (p: Pipe) => {
                    src = src.then(psrc => {
                        return Promise.resolve((_.isFunction(p) ? p(cfg, dt, gulp) : p))
                            .then(stram => {
                                return psrc.pipe(stram)
                            });
                    });
                })
            } else if (dt.pipe) {
                src = src.then((stream => {
                    return dt.pipe(stream, cfg, dt);
                }));
            }
            src.then(stream => {
                if (dt.output) {
                    let outputs = _.isFunction(dt.output) ? dt.output(cfg, dt) : dt.output;
                    return Promise.all(_.map(outputs, output => {
                        return new Promise((resolve, reject) => {
                            Promise.resolve<NodeJS.ReadWriteStream>((_.isFunction(output) ? output(stream, cfg, dt, gulp) : output))
                                .then(output => {
                                    stream.pipe(output)
                                        .once('end', resolve)
                                        .once('error', reject);
                                });

                        });
                    }));
                } else {
                    return new Promise((resolve, reject) => {
                        stream.pipe(gulp.dest(cfg.getDist(dt)))
                            .once('end', resolve)
                            .once('error', reject);
                    });
                }
            });
            return src.catch(err => {
                console.log(chalk.red(err));
            });
        });

        if (_.isNumber(dt.order)) {
            return <ITaskResult>{
                name: tk,
                order: dt.order
            };
        }
        return tk;
    }
}
