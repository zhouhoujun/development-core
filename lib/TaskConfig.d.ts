/// <reference types="gulp" />
/// <reference types="chai" />
/// <reference types="node" />
import { Gulp, WatchEvent, WatchCallback } from 'gulp';
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
export interface ITaskResult {
    name?: Src;
    oper?: Operation;
    order?: number;
}
export declare type TaskResult = Src | ITaskResult | void;
export declare type TaskSequence = TaskResult[];
export declare type Task = (gulp: Gulp, config: ITaskConfig) => TaskSequence;
export declare type TaskSource = Src | ((oper?: Operation) => Src);
export declare type TaskString = string | ((oper?: Operation) => string);
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
export declare type OutputPipe = (map: IOutput, config?: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;
export interface IOutputDist {
    src?: TaskSource;
    dist?: TaskString;
    build?: string;
    test?: string;
    e2e?: string;
    release?: string;
    deploy?: string;
}
export interface IDynamicTask extends IOutputDist {
    name: TaskString;
    order?: number;
    oper?: Operation;
    watch?: Array<string | WatchCallback> | ((config?: ITaskConfig, dt?: IDynamicTask) => Array<string | WatchCallback>);
    watchChanged?(event: WatchEvent, config: ITaskConfig): any;
    pipe?(gulpsrc: ITransform, config: ITaskConfig, dt?: IDynamicTask): ITransform | Promise<ITransform>;
    pipes?: Pipe[] | ((config?: ITaskConfig, dt?: IDynamicTask) => Pipe[]);
    output?: OutputPipe[] | ((config?: ITaskConfig, dt?: IDynamicTask) => OutputPipe[]);
    task?(config: ITaskConfig, dt?: IDynamicTask, gulp?: Gulp): void | ITransform | Promise<any>;
}
export interface IDynamicLoaderOption extends ILoaderOption {
    dynamicTasks?: IDynamicTask | IDynamicTask[];
}
export interface ITaskLoaderOption {
    loader: string | ILoaderOption | IDynamicTask | IDynamicTask[];
    externalTask?: Task;
    runTasks?: Src[] | ((oper: Operation, tasks: Src[], subGroupTask?: TaskResult, assertsTask?: TaskResult) => Src[]);
    tasks?: ITaskOption | ITaskOption[];
    subTaskOrder?: number;
}
export interface IAsserts extends IOutputDist {
    name?: TaskString;
    IAsserts?: IMap<Src | IAsserts | IDynamicTask[]>;
    assertsOrder?: number;
}
export interface ITaskOption extends IAsserts, ITaskLoaderOption {
    src: TaskSource;
}
export interface ITaskDefine {
    moduleTaskConfig(oper: Operation, option: ITaskOption, env: IEnvOption): ITaskConfig;
    moduleTaskLoader?(config: ITaskConfig): Promise<Task[]>;
}
export interface ITaskConfig {
    globals?: any;
    env: IEnvOption;
    oper: Operation;
    option: IAsserts | ITaskOption;
    runTasks?(subGroupTask?: TaskResult, tasks?: Src[], assertTasks?: TaskResult): Src[];
    printHelp?(lang: string): void;
    findTasksInModule?(module: string): Promise<Task[]>;
    findTasksInDir?(dirs: Src): Promise<Task[]>;
    getDist?(dist?: IOutputDist): string;
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask?(tasks: IDynamicTask | IDynamicTask[]): Task[];
    addTask?(sequence: Src[], taskResult: TaskResult): Src[];
    subTaskName?(name: string, defaultName?: string): any;
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
