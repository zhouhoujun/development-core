/// <reference types="gulp" />
import { RunWay } from './RunWay';
import { IOrder } from './IOrder';
import { ITaskContext } from './ITaskContext';
import { Operation } from './Operation';
import { ITransform } from './ITransform';
import { IPipe } from './IPipe';
import { IAssertDist } from './IAssertDist';
import { Gulp } from 'gulp';
import { IOutputPipe } from './IOutputPipe';
/**
 * Order type.
 */
export declare type Order = number | IOrder | ((total: number, ctx?: ITaskContext) => number | IOrder);
/**
 * zip task name.
 */
export declare type ZipTaskName = (name: string, runWay?: RunWay, ctx?: ITaskContext) => string;
/**
 * src
 */
export declare type Src = string | string[];
/**
 * async source.
 */
export declare type AsyncSrc = Src | Promise<Src>;
/**
 * task opertion.
 */
export declare type TaskOperation = Operation | ((ctx: ITaskContext) => Operation);
/**
 * context type
 */
export declare type CtxType<T> = T | ((ctx?: ITaskContext) => T);
/**
 * task execute result.
 */
export declare type TaskResult = Src | void;
/**
 * task source
 */
export declare type TaskSource = CtxType<Src>;
/**
 * task string
 */
export declare type TaskString = CtxType<string>;
/**
 * async task source.
 */
export declare type AsyncTaskSource = TaskSource | ((ctx?: ITaskContext) => Promise<Src>);
/**
 * transform source.
 */
export declare type TransformSource = ITransform | ITransform[];
export declare type Pipe = IPipe | ((ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);
export declare type OutputPipe = IOutputPipe | ((stream: ITransform, ctx?: ITaskContext, dist?: IAssertDist, gulp?: Gulp) => ITransform | Promise<ITransform>);
export declare type folderCallback = (folder: string, folderName?: string, ctx?: ITaskContext) => string;
