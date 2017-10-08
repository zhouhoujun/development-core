import { TaskString, TaskSource } from './types';
import { WatchCallback } from 'gulp';

/**
 * assert dist.
 *
 * @export
 * @interface IAssertDist
 * @extends {IOperate}
 */
export interface IAssertDist {
    /**
     * assert name
     *
     * @type {TaskString}
     * @memberof IOperate
     */
    name?: TaskString;

    /**
     * the src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    src?: TaskSource;

    /**
     * the e2e src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    e2eSrc?: TaskSource;

    /**
     * the test src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    testSrc?: TaskSource

    /**
     * clean special source in 'dist'. if not setting, default clean 'dist' folder.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    cleanSrc?: TaskSource;

    /**
     * auto create task to watch this source.
     *
     * @type {(boolean | Array<string | WatchCallback>)}
     * @memberof IAssertDist
     */
    watch?: boolean | Array<string | WatchCallback>;

    /**
     * the watch src file filter string. default 'src'.
     *
     * @type {TaskSource}
     * @memberof IAssertDist
     */
    watchSrc?: TaskSource;
    /**
     * default output folder. if empty use parent setting, or ues 'dist'.
     */
    dist?: TaskString;
    /**
     * build output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    buildDist?: TaskString;
    /**
     * test output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    testDist?: TaskString;
    /**
     * e2e output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    e2eDist?: TaskString;
    /**
     * release output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    releaseDist?: TaskString;
    /**
     * deploy output folder. if empty use parent setting, or ues 'dist'.
     *
     * @type {string}
     * @memberof Dist
     */
    deployDist?: TaskString;
}
