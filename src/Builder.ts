import { ITaskContext } from './ITaskContext';
import { IAsserts } from './IAsserts';


/**
 * Builder for task context
 *
 * @export
 * @interface Builder
 */
export interface Builder {
    /**
     * build context component.
     *
     * @template T
     * @param {ITaskContext} node
     * @param {T} [option]
     * @returns {ITaskContext}
     * @memberof Builder
     */
    build<T extends IAsserts>(node: ITaskContext, option?: T): ITaskContext | Promise<ITaskContext>;

    /**
     * the context is built or not.
     *
     * @param {ITaskContext} node
     * @returns {boolean}
     * @memberof Builder
     */
    isBuilt(node: ITaskContext): boolean;

}
