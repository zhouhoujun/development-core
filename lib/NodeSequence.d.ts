/**
 * current context run sequence with children context node.
 *
 * @export
 * @enum {number}
 */
export declare enum NodeSequence {
    /**
     * current context node run tasks before childe node run.
     */
    before = 1,
    /**
     * current context node run tasks after childe node run.
     */
    after = 2,
}
