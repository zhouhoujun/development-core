import { IOperate } from './IOperate';
import { Src } from './types';
/**
 * task decorator info.
 *
 * @export
 * @interface ITaskDecorator
 * @extends {IOperate}
 */
export interface ITaskDecorator extends IOperate {
    /**
     * assert tasks. assert group name or extends name.
     *
     * @type {Src}
     * @memberof ITaskInfo
     */
    group?: Src;
    /**
     * custom jduge info match to another.
     *
     * @param {ITaskDecorator} another
     *
     * @memberof ITaskInfo
     */
    match?(another: ITaskDecorator): any;
}
