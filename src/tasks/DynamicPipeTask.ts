import { Gulp } from 'gulp';
import * as coregulp from 'gulp';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import { PipeTask } from '../PipeTask';
import { IAssertOption } from '../IAssertOption';
import { RunWay } from '../RunWay';
import { ExecOptions } from 'child_process';
import { ITask, ITaskInfo } from '../ITask';
import { AsyncTaskSource, AsyncSrc, Pipe, OutputPipe } from '../types';
import { ITaskContext } from '../ITaskContext';
import { IDynamicTaskOption } from '../IDynamicTaskOption';
import { IAssertDist } from '../IAssertDist';
import { ITransform } from '../ITransform';
import { IPipe } from '../IPipe';
import { IOutputPipe } from '../IOutputPipe';


/**
 * pipe task for dynamic task.
 *
 * @class DynamicPipeTask
 * @extends {PipeTask}
 */
export class DynamicPipeTask extends PipeTask {
    constructor(private dt: IDynamicTaskOption, info?: ITaskInfo) {
        super(info || dt);
        this.info.assert = dt;
    }

    protected getOption(ctx: ITaskContext): IAssertDist {
        this.name = this.name || ctx.toStr(this.dt.name);
        return this.dt || ctx.option;
    }

    protected customPipe(source: ITransform, ctx: ITaskContext, dist: IAssertDist, gulp: Gulp) {
        if (this.dt.pipe) {
            return Promise.resolve(super.customPipe(source, ctx, dist, gulp))
                .then(stream => this.cpipe2Promise(stream, this.dt, ctx, dist, gulp));
        } else {
            return super.customPipe(source, ctx, dist, gulp)
        }
    }

    pipes(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): Pipe[] {
        let pipes = _.isFunction(this.dt.pipes) ? this.dt.pipes(ctx, dist, gulp) : this.dt.pipes;
        pipes = pipes || [];
        return pipes.concat(super.pipes(ctx, dist, gulp));
    }

    output(ctx: ITaskContext, dist: IAssertDist, gulp?: Gulp): OutputPipe[] {
        if (this.dt.output === null) {
            return [stream => stream];
        }
        let outputs = _.isFunction(this.dt.output) ? this.dt.output(ctx, dist, gulp) : this.dt.output;
        outputs = outputs || [];
        return outputs.concat(super.output(ctx, dist, gulp));
    }

}
