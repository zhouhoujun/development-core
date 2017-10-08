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



/**
 * shell option.
 *
 * @export
 * @interface IShellOption
 * @extends {IAssertOption}
 */
export interface IShellOption extends IAssertOption {
    /**
     * the shell command run way. default parallel.
     *
     * @type {RunWay}
     * @memberof IShellOption
     */
    shellRunWay?: RunWay;

    /**
     * exec options.
     *
     * @type {ExecOptions}
     * @memberof IShellOption
     */
    execOptions?: ExecOptions;

    /**
     * all child process has error.
     */
    allowError?: boolean;

}

/**
 * Shell Task
 *
 * @class ShellTask
 * @implements {ITask}
 */
export class ShellTask implements ITask {
    constructor(protected info: ITaskInfo, protected cmd: AsyncTaskSource) {

    }

    /**
     * get task info.
     */
    public getInfo(): ITaskInfo {
        return this.info;
    }

    execute(ctx: ITaskContext, gulp?: Gulp): Promise<any> {
        let option = ctx.option as IShellOption;
        let cmd = ctx.to<AsyncSrc>(this.cmd);
        return Promise.resolve(cmd)
            .then(cmds => {
                if (_.isString(cmds)) {
                    return ctx.execShell(cmds, option.execOptions, option.allowError !== false);
                } else if (_.isArray(cmds)) {
                    if (option.shellRunWay === RunWay.sequence) {
                        let pip = Promise.resolve();
                        _.each(cmds, cmd => {
                            pip = pip.then(() => ctx.execShell(cmd, option.execOptions));
                        });
                        return pip;
                    } else {
                        return Promise.all(_.map(cmds, cmd => ctx.execShell(cmd, option.execOptions, option.allowError !== false)));
                    }
                } else {

                    return Promise.reject('shell task config error');
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
        console.log(`register shell task:`, chalk.cyan(tk));

        gulp.task(tk, () => {
            return this.execute(ctx, gulp);
        });

        this.info.taskName = tk;

        return tk;
    }

}
