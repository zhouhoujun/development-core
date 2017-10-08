import { Src } from './types';

/**
 * event option
 *
 * @export
 * @interface IEnvOption
 */
export interface IEnvOption {
    /**
     * project root.
     *
     * @type {string}
     * @memberof IEnvOption
     */
    root?: string;
    /**
     * help doc
     *
     * @type {(boolean | string)}
     * @memberof IEnvOption
     */
    help?: boolean | string;
    test?: boolean | string;
    serve?: boolean | string;
    e2e?: boolean | string;
    release?: boolean;
    deploy?: boolean;
    watch?: boolean | string;
    /**
     * run spruce task.
     */
    task?: string;

    /**
     * project config setting.
     *
     * @type {string}
     * @memberof IEnvOption
     */
    config?: string;

    // key?: number;
    // value?: number;
    // csv?: string;
    // dist?: string;
    // lang?: string;

    publish?: boolean | string;

    /**
     * task group.
     *
     * @type {Src}
     * @memberof IEnvOption
     */
    group?: Src;

    /**
     * group bundle.
     *
     * @type {Src}
     * @memberof IEnvOption
     */
    gb?: Src;
}
