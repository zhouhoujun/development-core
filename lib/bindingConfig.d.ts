/// <reference types="chai" />
/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskDefine, TaskResult, IEnvOption, Operation, ITaskContext, ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString } from './TaskConfig';
/**
 * binding Config, create task context.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @param {ITaskContext} [parent]
 * @returns {ITaskContext}
 */
export declare function bindingConfig(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext;
/**
 * TaskContext
 *
 * @export
 * @class TaskContext
 * @implements {ITaskContext}
 */
export declare class TaskContext implements ITaskContext {
    private cfg;
    parent: ITaskContext;
    oper: Operation;
    option: IAsserts;
    env: IEnvOption;
    globals: any;
    protected setupTasks: ITask[];
    constructor(cfg: ITaskConfig, parent?: ITaskContext);
    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean;
    getSrc(task?: ITaskInfo, relative?: boolean): Src;
    getDist(task?: ITaskInfo, relative?: boolean): any;
    subTaskName(task: any, ext?: string): any;
    printHelp(lang: string): void;
    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]>;
    findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]>;
    findTaskDefine(module: string | Object): Promise<ITaskDefine>;
    findTaskDefineInDir(dirs: Src): Promise<ITaskDefine>;
    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
    runSequence(gulp: Gulp, tasks: Src[]): Promise<any>;
    generateTask(tasks: any, match?: any): any;
    addToSequence(sequence: Src[], task: ITaskInfo): Src[];
    toRootSrc(src: Src): Src;
    toRootPath(pathstr: string): string;
    toDistPath(pathstr: string): string;
    toSrc(source: TaskSource): Src;
    toStr(name: TaskString): string;
    private packages;
    getPackage(filename?: TaskString): any;
    setup(task: ITask, gulp?: Gulp): TaskResult;
    registerTasks(express?: (item: ITask) => boolean): ITask[];
}
/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
export declare function currentOperation(env: IEnvOption): Operation;
/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export declare function files(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]>;
/**
 * task src, string or array string.
 *
 * @export
 * @param {TaskSource} src
 * @param {Operation} oper runtime Operation
 * @param {IEnvOption} [env]
 * @returns
 */
export declare function taskSourceVal(src: TaskSource, ctx: ITaskContext): string | string[];
/**
 * task string.
 *
 * @export
 * @param {TaskString} name
 * @param {ITaskContext} ctx
 * @returns
 */
export declare function taskStringVal(name: TaskString, ctx: ITaskContext): string;
