

/**
 * project development build operation.
 *
 * @export
 * @enum {number}
 */
export enum Operation {
    /**
     * build compile project.
     */
    build = 1 << 0,
    /**
     * test project.
     */
    test = 1 << 1,
    /**
     * e2e test project.
     */
    e2e = 1 << 2,
    /**
     * release project.
     */
    release = 1 << 3,
    /**
     * release and deploy project.
     */
    deploy = 1 << 4,
    /**
     * clean task
     */
    clean = 1 << 5,
    /**
     * serve task
     */
    serve = 1 << 6,

    /**
     * watch task.
     */
    watch = 1 << 7,

    /**
     * auto create watch
     */
    autoWatch = 1 << 8,

    /**
     * default operation.
     */
    default = Operation.build | Operation.release | Operation.deploy,

    /**
     * define watch Operation (Operation.build | Operation.test | Operation.e2e | Operation.watch)
     */
    defaultWatch = Operation.build | Operation.test | Operation.e2e | Operation.watch
}
