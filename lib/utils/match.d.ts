import { ITaskContext } from '../ITaskContext';
import { ITaskDecorator } from '../ITaskDecorator';
/**
 * match
 *
 * @export
 * @param {ITaskContext} ctx
 * @param {ITaskDecorator} tinfo
 * @param {ITaskDecorator} match
 * @returns
 */
export declare function matchCompare(ctx: ITaskContext, tinfo: ITaskDecorator, match: ITaskDecorator): boolean;
