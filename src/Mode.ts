
/**
 * iterate context way.
 *
 * @export
 * @enum {number}
 */
export enum Mode {
    /**
     * route up. iterate in parents.
     */
    route = 1,
    /**
     * iterate in children.
     */
    children,
    /**
     * iterate as tree map.
     */
    traverse
}
