/**
 * iterate context way.
 *
 * @export
 * @enum {number}
 */
export declare enum Mode {
    /**
     * route up. iterate in parents.
     */
    route = 1,
    /**
     * iterate in children.
     */
    children = 2,
    /**
     * iterate as tree map.
     */
    traverse = 3,
}
