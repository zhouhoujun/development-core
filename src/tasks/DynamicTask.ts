import { Gulp } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource, AsyncSrc } from '../types';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';

/**
 * custom dynamic task.
 *
 * @class DynamicTask
 * @implements {ITask}
 */
export class DynamicTask implements ITask {
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
        let rt = this.dt.task(ctx, this.dt, gulp);
        if (rt && rt['then']) {
            return rt as Promise<any>;
        } else {
            return Promise.resolve(rt);
        }
    }

    setup(ctx: ITaskContext, gulp?: Gulp) {
        let tk = ctx.taskName(this.getInfo());
        console.log('register custom dynamic task:', chalk.cyan(tk));
        gulp.task(tk, () => {
            return this.execute(ctx, gulp);
        });

        this.info.taskName = tk;

        return tk;
    }
}
