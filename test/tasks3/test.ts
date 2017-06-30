import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext, RunWay } from '../../src';
// import * as chalk from 'chalk';
// import * as karam from 'karma';

import * as path from 'path';
// import * as mocha from 'gulp-mocha';
// import { IWebTaskOption } from '../WebTaskOption';

@task({
    order: { value: 0.25, runWay: RunWay.parallel },
    oper: Operation.default | Operation.test
})
export class KaramTest implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'test';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        // let option = <IWebTaskOption>ctx.option;

        let tkn = ctx.taskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
        //     let karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
        //     if (!path.isAbsolute(karmaConfigFile)) {
        //         karmaConfigFile = path.join(ctx.env.root, karmaConfigFile);
        //     }
        //     let cfg: karam.ConfigOptions = null;
        //     if (option.karmaConfig) {
        //         cfg = option.karmaConfig(ctx);
        //     }
        //     if (option.karamjspm) {
        //         cfg.files = cfg.files || [];
        //         cfg.frameworks
        //     }

        //     cfg = <karam.ConfigOptions>_.extend(cfg || { singleRun: ctx.env.release || ctx.env.deploy || ctx.env.watch !== true }, {
        //         configFile: karmaConfigFile
        //     });
        //     if (option.karmaBasePath) {
        //         cfg.basePath = ctx.toStr(option.karmaBasePath);
        //     } else if (_.isUndefined(cfg.basePath)) {
        //         cfg.basePath = ctx.getDist()
        //     }

        //     let serve = new karam.Server(
        //         cfg,
        //         (code: number) => {
        //             if (code === 1) {
        //                 console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(<any>code));
        //                 callback(<any>'Unit Test failures, exiting process');
        //             } else {
        //                 console.log('Unit Tests passed', ', code:', chalk.cyan(<any>code));
        //                 callback();
        //             }
        //         });

        //     if (option.karamjspm) {
        //         serve.on('file_list_modified', () => {

        //         });
        //     }
        //     serve.start();
        });

        return tkn;
    }
}

