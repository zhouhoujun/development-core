import { Gulp } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecOptions, ExecFileOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource, AsyncSrc } from '../types';
import { ITaskContext } from '../ITaskContext';



export interface IExecFileOption extends IAssertOption {
    /**
     * the file exec run way. default parallel.
     *
     * @type {RunWay}
     * @memberof IExecFileOption
     */
    fileRunWay?: RunWay;

    args?: string[];
    /**
     * exec file options.
     *
     * @type {ExecFileOptions}
     * @memberof IExecFileOption
     */
    execFileOptions?: ExecFileOptions;

    /**
     * all child process has error.
     */
    allowError?: boolean;

}


/**
 * exec file Task
 *
 * @class ExecFileTask
 * @implements {ITask}
 */
export class ExecFileTask implements ITask {
    constructor(protected info: ITaskInfo, protected files: AsyncTaskSource) {

    }

    /**
     * get task info.
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    execute(ctx: ITaskContext, gulp?: Gulp): Promise<any> {
        let option = ctx.option as IExecFileOption;
        let files = ctx.to<AsyncSrc>(this.files);
        return Promise.resolve(files)
            .then(files => {
                if (_.isString(files)) {
                    return ctx.execFile(files, option.args, option.execFileOptions, option.allowError !== false);
                } else if (_.isArray(files)) {
                    if (option.fileRunWay === RunWay.sequence) {
                        let pip = Promise.resolve();
                        _.each(files, file => {
                            pip = pip.then(() => ctx.execFile(file, option.args, option.execFileOptions, option.allowError !== false));
                        });
                        return pip;
                    } else {
                        return Promise.all(_.map(files, file => ctx.execFile(file, option.args, option.execFileOptions, option.allowError !== false)));
                    }
                } else {
                    return Promise.reject('exec file task config error');
                }
            });
    }

    /**
     * setup shell task.
     *
     * @param {ITaskContext} ctx
     * @param {Gulp} [gulp]
     * @returns
     *
     * @memberOf ShellTask
     */
    setup(ctx: ITaskContext, gulp?: Gulp) {
        gulp = gulp || coregulp;

        let tk = ctx.taskName(this.getInfo());
        console.log(`register exec file task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return this.execute(ctx, gulp);
        });

        this.info.taskName = tk;

        return tk;
    }

}
