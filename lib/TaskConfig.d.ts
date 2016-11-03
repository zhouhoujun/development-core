/// <reference types="node" />
/// <reference types="gulp" />
/// <reference types="chai" />
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
    test?: boolean | string;
    e2e?: boolean | string;
    group?: Src;
}
export declare type TaskResult = Src | void;
export declare type TaskSource = Src | ((oper?: Operation) => Src);
export declare type TaskString = string | ((oper?: Operation) => string);
export interface ITransform extends NodeJS.ReadWriteStream {
    order?: number;
    pipe(stream: NodeJS.ReadWriteStream): ITransform;
}
export interface IOutput extends ITransform {
    dts?: ITransform;
    js?: ITransform;
}
export interface IPipe {
    name?: string;
    order?: number;
    toTransform?(config: ITaskConfig, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}
export declare type Pipe = IPipe | ((config?: ITaskConfig, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);
export interface IOutputPipe {
    name?: string;
    toTransform?(stream: IOutput, config: ITaskConfig, dist?: IAssertDist, gulp?: Gulp): ITransform | Promise<ITransform>;
}
export declare type OutputPipe = IOutputPipe | ((stream: IOutput, config?: ITaskConfig, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);
export interface IAssertDist {
    name?: TaskString;
    src?: TaskSource;
    e2eSrc?: TaskSource;
    testSrc?: TaskSource;
    watchSrc?: TaskSource;
    dist?: TaskString;
    buildDist?: string;
    testDist?: string;
    e2eDist?: string;
    releaseDist?: string;
    deployDist?: string;
}
export interface ITask {
    decorator: ITaskInfo;
    setup(config: ITaskConfig, gulp?: Gulp): TaskResult;
}
export interface IPipeOption {
    pipe?(gulpsrc: ITransform, config: ITaskConfig, dist?: IAssertDist, callback?: TaskCallback): ITransform | Promise<ITransform> | void;
    pipes?: Pipe[] | ((config?: ITaskConfig, dist?: IAssertDist, gulp?: Gulp) => Pipe[]);
    output?: IOutputPipe[] | ((config?: ITaskConfig, dist?: IAssertDist, gulp?: Gulp) => IOutputPipe[]);
}
export interface IDynamicTaskOption extends IAssertDist, IPipeOption, ITaskInfo {
    name: TaskString;
    watchTasks?: Array<string | WatchCallback> | ((config?: ITaskConfig, dt?: IDynamicTaskOption) => Array<string | WatchCallback>);
    watchChanged?(event: WatchEvent, config: ITaskConfig): any;
    task?(config: ITaskConfig, dt?: IDynamicTaskOption, gulp?: Gulp): void | ITransform | Promise<any>;
}
export interface IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}
export interface ILoaderOption extends IPipeOption {
    type?: string;
    module?: string | Object;
    configModule?: string | Object;
    taskModule?: string | Object;
    taskDefine?: ITaskDefine;
}
export interface IDirLoaderOption extends ILoaderOption {
    dir?: TaskSource;
    dirConfigFile?: string;
}
export interface IDynamicLoaderOption extends ILoaderOption {
    dynamicTasks?: IDynamicTaskOption | IDynamicTaskOption[];
}
export declare type customLoader = (config: ITaskConfig) => ITask[] | Promise<ITask[]>;
export interface ITaskLoaderOption {
    loader?: string | customLoader | ILoaderOption | IDynamicTaskOption | IDynamicTaskOption[];
}
export interface ISubTaskOption {
    tasks?: ITaskOption | ITaskOption[];
    subTaskOrder?: number;
}
export interface IAsserts extends IAssertDist, ITaskLoaderOption {
    asserts?: IMap<Src | IAsserts | IDynamicTaskOption[]>;
    assertsOrder?: number;
}
export interface ITaskOption extends IAsserts, ISubTaskOption {
    loader: string | customLoader | ILoaderOption | IDynamicTaskOption | IDynamicTaskOption[];
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
    getSrc?(assert?: IAssertDist, taskinfo?: ITaskInfo): Src;
    getDist?(dist?: IAssertDist): string;
    runTasks?(tasks?: Src[], assertTasks?: ITaskInfo, subGroupTask?: ITaskInfo): Src[];
    printHelp?(lang: string): void;
    findTasks?(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;
    findTasksInDir?(dirs: Src, match?: ITaskInfo): Promise<ITask[]>;
    findTaskDefine?(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir?(dirs: Src): Promise<ITaskDefine>;
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask?(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[];
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
    group?: Src;
    gb?: Src;
}
