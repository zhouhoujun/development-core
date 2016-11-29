
import * as _ from 'lodash';
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, Operation, task, ITaskContext } from '../../src';

const del = require('del');

@task({
    order: 0,
    oper: Operation.clean | Operation.default
})
export class Clean implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'task3-clean';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let info = this.getInfo();
        let tkn = ctx.subTaskName(info);
        gulp.task(tkn, () => {
            return del(ctx.getSrc(info));
        });

        return tkn;
    }
}

