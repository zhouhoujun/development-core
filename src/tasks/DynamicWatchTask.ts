import { Gulp, WatchEvent } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import { runSequence } from '../taskSequence';
import * as watch from 'gulp-watch';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource, AsyncSrc } from '../types';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';
/**
 * custom dynamic watch task.
 *
 * @class DynamicWatchTask
 * @implements {ITask}
 */
export class DynamicWatchTask implements ITask {
    constructor(protected info: ITaskInfo, protected dt: IDynamicTaskOption) {
    }

    /**
     * get task info.
     *
     * @type {ITaskInfo}
     * @memberOf PipeTask
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    execute(ctx: ITaskContext, gulp?: Gulp): Promise<any> {
        return Promise.resolve();
    }

    setup(ctx: ITaskContext, gulp?: Gulp) {
        let dt = this.dt;
        let watchs = _.isFunction(dt.watchTasks) ? dt.watchTasks(ctx, dt) : dt.watchTasks;
        let callback;
        if (!_.isFunction(_.last(watchs))) {
            callback = (event: WatchEvent) => {
                dt.watchChanged && dt.watchChanged(event, ctx);
            };
        } else {
            callback = watchs.pop();
        }

        watchs = _.map(watchs, w => {
            if (_.isString(w)) {
                return ctx.taskName(w);
            }
            return w;
        })
        let info = this.getInfo();
        let tk = ctx.taskName(info);
        console.log('register watch  dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            let src = ctx.getSrc(info);
            console.log('watch, src:', chalk.cyan.call(chalk, src));
            // watch(src, watchs);
            watch(src, null, () => {
                runSequence(gulp, <string[]>watchs)
                    .then(() => {
                        callback && callback();
                    });
            });
        });

        return tk;
    }
}
