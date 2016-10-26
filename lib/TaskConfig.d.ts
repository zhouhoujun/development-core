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
export declare type TaskResult = Src | ITaskResult;
export declare type Task = (gulp: Gulp, config: TaskConfig) => TaskResult | TaskResult[] | void;
export declare function task(constructor: Function): void;
export interface LoaderOption {
    type?: string;
    module?: string | Object;
    configModule?: string | Object;
    taskModule?: string | Object;
    taskDefine?: ITaskDefine;
    isTaskFunc?(mdl: any): boolean;
    isTaskDefine?(mdl: any): boolean;
}
export interface DirLoaderOption extends LoaderOption {
    dir?: Src;
    dirConfigFile?: string;
}
export interface ITransform extends NodeJS.ReadWriteStream {
    pipe(stream: NodeJS.ReadWriteStream): ITransform;
}
export interface Output extends ITransform {
    dts?: ITransform;
    js?: ITransform;
}
export declare type Pipe = (config?: TaskConfig, dt?: DynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;
export declare type OutputPipe = (map: Output, config?: TaskConfig, dt?: DynamicTask, gulp?: Gulp) => ITransform | Promise<ITransform>;
export interface OutputDist {
    src?: Src;
    dist?: string;
    build?: string;
    test?: string;
    e2e?: string;
    release?: string;
    deploy?: string;
}
export interface DynamicTask extends OutputDist {
    name: string;
    order?: number;
    oper?: Operation;
    watch?: Array<string | WatchCallback> | ((config?: TaskConfig, dt?: DynamicTask) => Array<string | WatchCallback>);
    watchChanged?(event: WatchEvent, config: TaskConfig): any;
    pipe?(gulpsrc: ITransform, config: TaskConfig, dt?: DynamicTask): ITransform | Promise<ITransform>;
    pipes?: Pipe[] | ((config?: TaskConfig, dt?: DynamicTask) => Pipe[]);
    output?: OutputPipe[] | ((config?: TaskConfig, dt?: DynamicTask) => OutputPipe[]);
    task?(config: TaskConfig, dt?: DynamicTask, gulp?: Gulp): void | ITransform | Promise<any>;
}
export interface DynamicLoaderOption extends LoaderOption {
    dynamicTasks?: DynamicTask | DynamicTask[];
}
export interface TaskLoaderOption {
    loader: string | LoaderOption | DynamicTask | DynamicTask[];
    externalTask?: Task;
    runTasks?: Src[] | ((oper: Operation, tasks: Src[], subGroupTask?: TaskResult, assertsTask?: TaskResult) => Src[]);
    tasks?: TaskOption | TaskOption[];
    subTaskOrder?: number;
}
export interface Asserts extends OutputDist, TaskLoaderOption {
    name?: string;
    asserts?: IMap<Src | Asserts | DynamicTask[]>;
    assertsOrder?: number;
}
export interface TaskOption extends Asserts {
    src: Src;
}
export interface ITaskDefine {
    moduleTaskConfig(oper: Operation, option: TaskOption, env: EnvOption): TaskConfig;
    moduleTaskLoader?(config: TaskConfig): Promise<Task[]>;
}
export interface TaskConfig {
    globals?: any;
    env: EnvOption;
    oper: Operation;
    option: TaskOption;
    runTasks?(subGroupTask?: TaskResult, tasks?: Src[], assertTasks?: TaskResult): Src[];
    printHelp?(lang: string): void;
    findTasksInModule?(module: string): Promise<Task[]>;
    findTasksInDir?(dirs: Src): Promise<Task[]>;
    getDist?(dist?: OutputDist): string;
    fileFilter?(directory: string, express?: ((fileName: string) => boolean)): string[];
    runSequence?(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask?(tasks: DynamicTask | DynamicTask[]): Task[];
    addTask?(sequence: Src[], taskResult: TaskResult): Src[];
    subTaskName?(name: string, defaultName?: string): any;
}
export interface EnvOption {
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
export declare function bindingConfig(cfg: TaskConfig): TaskConfig;
export declare function currentOperation(env: EnvOption): Operation;
export declare function toSequence(tasks: Array<TaskResult | TaskResult[] | void>, oper: Operation): Src[];
export declare function runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
export declare function files(directory: string, express?: ((fileName: string) => boolean)): string[];
export declare function generateTask(tasks: DynamicTask | DynamicTask[], oper: Operation, env: EnvOption): Task[];
