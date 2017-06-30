import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext, RunWay } from '../../src';
// import { IWebTaskOption } from '../WebTaskOption';
// import * as browserSync from 'browser-sync';

@task({
    order: (total, ctx) => ctx.env.test ? { value: 0.25, runWay: RunWay.parallel } : 1, // last order.
    oper: Operation.default | Operation.serve
})
export class StartService implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'serve';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option: any = ctx.option;

        let files: string[] = null;
        if (option.serverFiles) {
            files = _.isFunction(option.serverFiles) ? option.serverFiles(ctx) : option.serverFiles;
        }
        files = files || [];
        let dist = ctx.getDist(this.getInfo());
        let baseDir: Src = null;
        if (option.serverBaseDir) {
            baseDir = _.isFunction(option.serverBaseDir) ? option.serverBaseDir(ctx) : option.serverBaseDir;
        } else {
            baseDir = dist;
        }
        files.push(`${dist}/**/*`);

        let browsersyncOption = {
            server: {
                baseDir: baseDir
            },
            open: true,
            port: process.env.PORT || 3000,
            files: files
        };

        if (option.browsersync) {
            browsersyncOption = _.extend(browsersyncOption, _.isFunction(option.browsersync) ? option.browsersync(ctx, browsersyncOption) : option.browsersync);
        }
        let tkn = ctx.taskName(this.info);
        gulp.task(tkn, (callback: TaskCallback) => {
            callback();
            // browserSync(browsersyncOption, (err, bs) => {
            //     if (err) {
            //         callback(<any>err);
            //     }
            // });
        });

        return tkn;
    }
}
