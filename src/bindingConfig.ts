import * as _ from 'lodash';
import { Gulp } from 'gulp';
import {
    ITask, IContextDefine, TaskResult, IAssertDist, IEnvOption, Operation, ITaskContext
    , ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString, folderCallback
} from './TaskConfig';
import { generateTask } from './generateTask';
import { runSequence, addToSequence } from './taskSequence';
import { matchCompare, absoluteSrc, absolutePath } from './utils';
import { findTasksInModule, findTaskDefineInModule, findTasksInDir, findTaskDefineInDir } from './decorator';
import * as path from 'path';
import * as fs from 'fs';
const globby = require('globby');

/**
 * binding Config, create task context.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @param {ITaskContext} [parent]
 * @returns {ITaskContext}
 */
export function bindingConfig(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext {
    if (cfg.createContext) {
        return cfg.createContext(cfg, parent);
    }
    return new TaskContext(cfg, parent);
}

/**
 * global data.
 */
let globals = {};

/**
 * TaskContext
 *
 * @export
 * @class TaskContext
 * @implements {ITaskContext}
 */
export class TaskContext implements ITaskContext {
    public oper: Operation;
    public option: IAsserts;
    public env: IEnvOption;
    public globals: any;
    protected setupTasks: ITask[] = [];
    protected children: ITaskContext[] = [];
    constructor(private cfg: ITaskConfig, public parent?: ITaskContext) {
        this.env = cfg.env;
        this.oper = currentOperation(cfg.env);
        this.option = cfg.option;
        this.globals = cfg.globals || globals;
    }

    /**
     * add sub ITaskContext
     *
     * @param {ITaskContext} context
     *
     * @memberOf ITaskContext
     */
    add(context: ITaskContext): void {
        context.parent = this;
        this.children.push(context);
    }
    /**
     * remove sub ITaskContext.
     *
     * @param {ITaskContext} [context]
     *
     * @memberOf ITaskContext
     */
    remove(context?: ITaskContext): ITaskContext[] {
        let items = _.remove(this.children, context);
        _.each(items, i => {
            if (i) {
                i.parent = null;
            }
        });
        return items;
    }

    /**
     * find sub context via express.
     *
     * @param {(ITaskContext | ((item: ITaskContext) => boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     * @returns {ITaskContext}
     *
     * @memberOf ITaskContext
     */
    find(express: ITaskContext | ((item: ITaskContext) => boolean), mode?: string): ITaskContext {
        let context: ITaskContext;
        this.each(item => {
            if (context) {
                return false;
            }
            let isFinded = _.isFunction(express) ? express(item) : (<ITaskContext>express) === item;
            if (isFinded) {
                context = item;
                return false;
            }
            return true;
        }, mode);
        return context;
    }

    /**
     * filter items.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     * @returns {ITaskContext[]}
     *
     * @memberOf ITaskContext
     */
    filter(express: ((item: ITaskContext) => void | boolean), mode?: string): ITaskContext[] {
        let contexts: ITaskContext[] = [];
        this.each(item => {
            if (express(item)) {
                contexts.push(item);
            }
        }, mode);
        return contexts;
    }
    /**
     * find parent context via express.
     *
     * @param {(ITaskContext | ((item: ITaskContext) => boolean))} express
     * @param {string} [mode] {enum:['route','children', traverse']} default traverse.
     *
     * @memberOf ITaskContext
     */
    each(express: ((item: ITaskContext) => void | boolean), mode?: string) {
        mode = mode || '';
        let r;
        switch (mode) {
            case 'route':
                r = this.route(express);
                break;
            case 'children':
                r = this.eachChildren(express);
                break;

            case 'traverse':
                r = this.trans(express);
                break;
            default:
                r = this.trans(express);
                break;
        }
        return r;
    }

    eachChildren(express: ((item: ITaskContext) => void | boolean)) {
        _.each(this.children, item => {
            return express(item);
        });
    }

    /**
     * do express work in routing.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     *
     * @memberOf ITaskContext
     */
    route(express: ((item: ITaskContext) => void | boolean)) {
        if (!express(this)) {
            return false;
        };
        if (this.parent && this.parent.route) {
            return this.parent.route(express);
        }
    }
    /**
     * translate all sub context to do express work.
     *
     * @param {(((item: ITaskContext) => void | boolean))} express
     *
     * @memberOf ITaskContext
     */
    trans(express: ((item: ITaskContext) => void | boolean)) {
        if (express(this) === false) {
            return false;
        }
        _.each(this.children, item => {
            return item.trans(express);
        });
        return true;
    }

    matchCompare(task: ITaskInfo, match: ITaskInfo): boolean {
        if (this.option.match) {
            return this.option.match(task, match);
        }
        return matchCompare(task, match);
    }

    getSrc(task?: ITaskInfo, relative = false): Src {
        let src: Src;
        let ctx = this;
        let oper = task ? (task.oper || ctx.oper) : ctx.oper;
        if (task && task.assert) {
            src = taskSourceVal(getAssertSrc(task.assert, oper), ctx)
        }

        if (!src) {
            this.route(c => {
                src = taskSourceVal(getAssertSrc(c.option, oper), c);
                if (src) {
                    return false;
                }
                return true;
            });
        }
        return (relative !== false) ? src : absoluteSrc(ctx.env.root, src);
    }

    getDist(task?: ITaskInfo, relative = false): string {
        let dist: string;
        let ctx = this;
        // let oper = task ? (task.oper || context.oper) : context.oper;
        if (task && task.assert) {
            dist = getCurrentDist(task.assert, ctx);
        }
        if (!dist) {
            this.route(c => {
                dist = getCurrentDist(c.option, c);
                if (dist) {
                    return false;
                }
                return true;
            });
        }

        return (relative !== false) ? dist : absolutePath(ctx.env.root, dist);
    }

    subTaskName(task, ext = '') {
        let ctx = this;
        let name = '';
        // let oper = context.oper;
        if (_.isString(task)) {
            name = task;
        } else if (task && task !== ctx.option) {
            // oper = task.oper || context.oper;
            if (task.name) {
                name = taskStringVal(task.name, ctx)
            }
            if (!name && task.assert && task.assert.name) {
                name = taskStringVal(task.assert.name, ctx)
            }
        }
        let optName: string;
        this.route(c => {
            optName = taskStringVal(c.option.name, c);
            if (optName) {
                return false;
            }
            return true;
        })

        if (optName) {
            if (name.indexOf(optName + '-') === 0) {
                return name;
            }
            // avoid soma name.
            if (name && optName !== name) {
                return `${optName}-${name}` + ext;
            }
            return optName + ext;
        } else {
            return name + ext;
        }
    }

    printHelp(lang: string): void {
        if (this.cfg.printHelp) {
            this.cfg.printHelp(lang);
        }
    }

    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]> {
        let ctx = this;
        return findTasksInModule(module, _.extend({ oper: ctx.oper }, match || {}), this);
    }

    findTasksInDir(dirs: Src, match?: ITaskInfo): Promise<ITask[]> {
        let ctx = this;
        return findTasksInDir(dirs, _.extend({ oper: ctx.oper }, match || {}), this);
    }

    findTaskDefine(module: string | Object): Promise<IContextDefine> {
        return findTaskDefineInModule(module);
    }

    findTaskDefineInDir(dirs: Src): Promise<IContextDefine> {
        return findTaskDefineInDir(dirs);
    }

    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]> {
        return files(express, filter, mapping);
    }

    runSequence(gulp: Gulp, tasks: Src[]): Promise<any> {
        return runSequence(gulp, tasks);
    }

    generateTask(tasks, match?) {
        let ctx = this;
        return generateTask(tasks, _.extend({ oper: ctx.oper }, match || {}), this);
    }

    addToSequence(sequence: Src[], task: ITaskInfo): Src[] {
        if (this.cfg.addToSequence) {
            return this.cfg.addToSequence(sequence, task);
        }
        return addToSequence(sequence, task, this);
    }

    getRootPath() {
        return this.env.root;
    }

    getRootFolders(express?: folderCallback): string[] {
        return this.getFolders(this.getRootPath(), express);
    }

    getFolders(pathstr: string, express?: folderCallback): string[] {
        let dir = fs.readdirSync(pathstr);
        let folders = [];
        _.each(dir, (d: string) => {
            let sf = path.join(pathstr, d);
            let f = fs.lstatSync(sf);
            if (f.isDirectory()) {
                if (express) {
                    let fl = express(sf, d, this);
                    if (fl) {
                        folders.push(fl);
                    }
                } else {
                    folders.push(sf);
                }
            }
        });
        return folders;
    }

    getDistFolders(express?: folderCallback, task?: ITaskInfo): string[] {
        return this.getFolders(this.getDist(task), express);
    }

    toRootSrc(src: Src): Src {
        return absoluteSrc(this.cfg.env.root, src);
    }

    toRootPath(pathstr: string): string {
        return absolutePath(this.cfg.env.root, pathstr);
    }

    toDistSrc(src: Src, task?: ITaskInfo): Src {
        return absoluteSrc(this.getDist(task), src);
    }

    toDistPath(pathstr: string, task?: ITaskInfo): string {
        return absolutePath(this.getDist(task), pathstr);
    }

    to<T>(setting: T | ((ctx: ITaskContext) => T)): T {
        return _.isFunction(setting) ? setting(this) : setting;
    }

    toSrc(source: TaskSource): Src {
        return taskSourceVal(source, this);
    }

    toStr(name: TaskString): string {
        return taskStringVal(name, this);
    }

    toUrl(basePath: string, toPath?: string): string {
        return (toPath ? path.relative(basePath, toPath) : basePath).replace(/\\/g, '/').replace(/^\//g, '');
    }

    private packages = {};
    getPackage(filename?: TaskString): any {
        filename = filename || this.cfg.packageFile;
        let name = this.toRootPath(this.toStr(filename) || 'package.json');
        if (!this.packages[name]) {
            this.packages[name] = require(name);
        }
        return this.packages[name]
    }

    setup(task: ITask, gulp?: Gulp): TaskResult {
        let rs = task.setup(this, gulp);
        this.setupTasks.push(task);
        return rs;
    }

    tasks(express?: (item: ITask) => boolean): ITask[] {
        return express ? _.filter(this.setupTasks, express) : this.setupTasks;
    }

    registerTasks(express?: (item: ITask) => boolean): ITask[] {
        let tasks = [];
        this.each(c => {
            tasks = tasks.concat(c.tasks(express));
        });
        return tasks;
    }

    globalTasks(): string[] {
        return _.keys(this.globals.tasks || {});
    }
}


/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
export function currentOperation(env: IEnvOption) {
    let oper: Operation;
    if (env.deploy) {
        oper = Operation.deploy | Operation.release;
    } else if (env.release) {
        oper = Operation.release;
    } else {
        oper = Operation.build;
    }

    if (env.watch) {
        oper = oper | Operation.watch;
    }
    if (env.test) {
        oper = oper | Operation.test;
    }
    if (env.serve) {
        oper = oper | Operation.serve;
    }
    if (env.e2e) {
        oper = oper | Operation.e2e;
    }

    return oper;
}

/**
 * get assert source.
 *
 * @param {IAssertDist} assert
 * @param {Operation} oper
 * @returns
 */
function getAssertSrc(assert: IAssertDist, oper: Operation) {
    let src = null;

    if ((oper & Operation.test) > 0) {
        src = assert.testSrc;
    } else if ((oper & Operation.e2e) > 0) {
        src = assert.e2eSrc;
    } else if ((oper & Operation.watch) > 0) {
        src = assert.watchSrc;
    } else if ((oper & Operation.clean) > 0) {
        src = assert.cleanSrc || assert.dist;
    }


    return src || assert.src;
}

/**
 * get dist.
 *
 * @param {IAssertDist} ds
 * @param {ITaskContext} ctx
 * @returns
 */
function getCurrentDist(ds: IAssertDist, ctx: ITaskContext) {
    let dist: string;
    let env = ctx.env;
    let oper = ctx.oper;
    if (env.deploy || (oper & Operation.deploy) > 0) {
        dist = taskStringVal(ds.deployDist, ctx);
    }
    if (!dist && (env.release || (oper & Operation.release) > 0)) {
        dist = taskStringVal(ds.releaseDist, ctx);
    }
    if (!dist && (env.e2e || (oper & Operation.e2e) > 0)) {
        dist = taskStringVal(ds.e2eDist, ctx);
    }
    if (!dist && (env.test || (oper & Operation.test) > 0)) {
        dist = taskStringVal(ds.testDist, ctx);
    }
    if (!dist && ((oper & Operation.build) > 0)) {
        dist = taskStringVal(ds.buildDist, ctx);
    }
    if (!dist) {
        dist = taskStringVal(ds.dist, ctx);
    }

    return dist;
}


/**
 * filter fileName in directory.
 *
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export function files(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]> {
    return Promise.resolve(globby(express))
        .then((files: string[]) => {
            if (filter) {
                files = _.filter(files, filter)
            }
            if (mapping) {
                files = _.map(files, mapping);
            }
            return files;
        })
}

/**
 * task src, string or array string.
 *
 * @export
 * @param {TaskSource} src
 * @param {Operation} oper runtime Operation
 * @param {IEnvOption} [env]
 * @returns
 */
export function taskSourceVal(src: TaskSource, ctx: ITaskContext) {
    return _.isFunction(src) ? src(ctx) : (src || '');
}

/**
 * task string.
 *
 * @export
 * @param {TaskString} name
 * @param {ITaskContext} ctx
 * @returns
 */
export function taskStringVal(name: TaskString, ctx: ITaskContext) {
    return _.isFunction(name) ? name(ctx) : (name || '');
}
