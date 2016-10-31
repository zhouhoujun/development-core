/// <reference types="gulp" />
/// <reference types="chai" />
/// <reference types="node" />
import { Gulp, WatchEvent, WatchCallback, TaskCallback } from 'gulp';
export declare enum Operation {
    build = 1,
    test = 2,
    e2e = 4,
    release = 8,
    deploy = 16,
}
export interface IMap<T> {
    [K: string]: T;
}
export declare type Src = string | string[];
export interface ITaskInfo {
    oper?: Operation;
    order?: number;
    taskName?: Src;
    watch?: boolean | string;
    group?: string;
}
export declare type TaskResult = Src | void;
export declare type TaskSource = Src | ((oper?: Operation) => Src);
export declare type TaskString = string | ((oper?: Operation) => string);
export interface ITask {
    decorator: ITaskInfo;
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
export interface IDynamicTasks {
    tasks(): IDynamicTask[];
}
export interface ILoaderOption {
    type?: string;
    module?: string | Object;
    configModule?: string | Object;
    taskModule?: string | Object;
    taskDefine?: ITaskDefine;
    isTaskFunc?(mdl: any): boolean;
    isTaskDefine?(mdl: any): boolean;
}
export interface IDirLoaderOption extends ILoaderOption {
    dir?: TaskSource;
    dirConfigFile?: string;
}
export interface ITransform extends NodeJS.ReadWriteStream {
    pipe(stream: NodeJS.ReadWriteStream): ITransform;
}
export interface IOutput extends ITransform {
    dts?: ITransform;
    js?: ITransform;
}
export declare type Pipe = (config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;
export declare type OutputPipe = (stream: IOutput, config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;
export interface IOutputDist {
    src?: TaskSource;
    dist?: TaskString;
    build?: string;
    test?: string;
    e2e?: string;
    release?: string;
    deploy?: string;
}
export interface IDynamicTask extends IOutputDist, ITaskInfo {
    name: TaskString;
    watchTasks?: Array<string | WatchCallback> | ((config?: ITaskConfig, dt?: IDynamicTask) => Array<string | WatchCallback>);
    watchChanged?(event: WatchEvent, config: ITaskConfig): any;
    pipe?(gulpsrc: ITransform, config: ITaskConfig, dt?: IDynamicTask, callback?: TaskCallback): ITransform | Promise<ITransform> | void;
    pipes?: Pipe[] | ((config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => Pipe[]);
    output?: OutputPipe[] | ((config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => OutputPipe[]);
    task?(config: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp): void | ITransform | Promise<any>;
}
export interface IDynamicLoaderOption extends ILoaderOption {
    dynamicTasks?: IDynamicTask | IDynamicTask[];
}
export interface ITaskLoaderOption {
    loader?: string | ILoaderOption | IDynamicTask | IDynamicTask[];
}
export interface ISubTaskOption {
    tasks?: ITaskOption | ITaskOption[];
    subTaskOrder?: number;
}
export interface IAsserts extends IOutputDist, ITaskLoaderOption {
    name?: TaskString;
    asserts?: IMap<Src | IAsserts | IDynamicTask[]>;
    assertsOrder?: number;
}
export interface ITaskOption extends IAsserts, ISubTaskOption {
    loader: string | ILoaderOption | IDynamicTask | IDynamicTask[];
    src: TaskSource;
}
export interface ITaskDefine {
    loadConfig(oper: Operation, option: ITaskOption, env: IEnvOption): ITaskConfig;
    loadTasks?(config: ITaskConfig): Promise<ITask[]>;
}
export interface ITaskConfig {
    globals?: any;
    env: IEnvOption;
    oper: Operation;
    option: IAsserts | ITaskOption;
    getSrc?(assert?: IAsserts): Src;
    getDist?(dist?: IOutputDist): string;
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];
    printHelp?(lang: string): void;
    findTasks?(module: string | Object): Promise<ITask[]>;
    findTasksInDir?(dirs: Src): Promise<ITask[]>;
    findTaskDefine?(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir?(dirs: Src): Promise<ITaskDefine>;
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask?(tasks: IDynamicTask | IDynamicTask[]): ITask[];
    addToSequence?(sequence: Src[], task: ITaskInfo): Src[];
    subTaskName?(assert: string | IAsserts, defaultName?: string): any;
}
export interface IEnvOption {
    root?: string;
    help?: boolean | string;
    test?: boolean | string;
    serve?: boolean | string;
    e2e?: boolean | string;
    release?: boolean;
    deploy?: boolean;
    watch?: boolean | string;
    task?: string;
    config?: string;
    publish?: boolean | string;
    grp?: Src;
}
