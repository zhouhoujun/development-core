/**
 * project development build operation.
 *
 * @export
 * @enum {number}
 */
export declare enum Operation {
    /**
     * build compile project.
     */
    build = 1,
    /**
     * test project.
     */
    test = 2,
    /**
     * e2e test project.
     */
    e2e = 4,
    /**
     * release project.
     */
    release = 8,
    /**
     * release and deploy project.
     */
    deploy = 16,
    /**
     * clean task
     */
    clean = 32,
    /**
     * serve task
     */
    serve = 64,
    /**
     * watch task.
     */
    watch = 128,
    /**
     * auto create watch
     */
    autoWatch = 256,
    /**
     * default operation.
     */
    default = 25,
    /**
     * define watch Operation (Operation.build | Operation.test | Operation.e2e | Operation.watch)
     */
    defaultWatch = 135,
}
