import *as _ from 'lodash';
import { Gulp } from 'gulp';
import *as gulp from 'gulp';
import * as minimist from 'minimist';
import {
    ITask, IAssertDist, IEnvOption, Operation, ITaskContext, ITaskDefine, IDynamicTaskOption
    , NodeSequence, RunWay, ZipTaskName, Express, Mode, ITaskConfig, ITaskInfo, Src, TaskSource, IAsserts, TaskString, folderCallback
} from './TaskConfig';
import { generateTask } from './generateTask';
import { toSequence, runSequence, addToSequence, zipSequence, flattenSequence, runTaskSequence } from './taskSequence';
import { sortOrder, matchCompare, absoluteSrc, absolutePath } from './utils';
import { findTasksInModule, findTaskDefineInModule, findTasksInDir, findTaskDefineInDir } from './findTasks';
import *as path from 'path';
import *as fs from 'fs';
const globby = require('globby');

/**
 *binding Config, create task context.
 *
 *@export
 *@param {ITaskConfig} cfg
 *@param {ITaskContext} [parent]
 *@returns {ITaskContext}
 */
export function bindingConfig(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext {
    return createContext(cfg, parent);
}

/**
 *create Task context.
 *
 *@export
 *@param {ITaskConfig} cfg
 *@param {ITaskContext} [parent]
 *@returns {ITaskContext}
 */
export function createContext(cfg: ITaskConfig, parent?: ITaskContext): ITaskContext {
    if (cfg.createContext) {
        return cfg.createContext(cfg, parent);
    }
    return new TaskContext(cfg, parent);
}

/**
 *global data.
 */
let globals = {};

/**
 *TaskContext
 *
 *@export
 *@class TaskContext
 *@implements {ITaskContext}
 */
export class TaskContext implements ITaskContext {
    protected cfg: ITaskConfig;
    protected taskseq: ITask[] = [];

    protected sequence: Src[] = [];
    protected children: ITaskContext[] = [];

    oper: Operation;
    option: IAsserts;
    env: IEnvOption;
    globals: any;

    constructor(cfg: ITaskConfig, public parent?: ITaskContext) {
        if (parent) {
            parent.add(this);
            let pcfg: ITaskConfig = _.omit(parent.getConfig(), 'option');
            pcfg.env = pcfg.env || this.createEnv();
            this.setConfig(pcfg);
        } else {
            cfg = cfg || {};
            cfg.env = cfg.env || this.createEnv();
        }
        this.setConfig(cfg);
    }

    private _gulp: Gulp;
    get gulp() {
        return this._gulp || gulp;
    }
    set gulp(gulp: Gulp) {
        this._gulp = gulp;
    }

    protected createEnv(): IEnvOption {
        let env: IEnvOption = minimist(process.argv.slice(2), {
            string: 'env',
            default: { env: process.env.NODE_ENV || 'development' }
        }) as IEnvOption;
        return env;
    }

    protected setEnvViaOperate(oper: Operation) {
        this.env = this.env || {};
        if ((oper & Operation.deploy) > 0) {
            this.env.deploy = true;
            this.env.release = false;
        } else if ((oper & Operation.release) > 0) {
            this.env.release = true;
            this.env.deploy = false;
            oper = Operation.release;
        }

        if ((oper & Operation.watch) > 0) {
            this.env.watch = true;
        }

        if ((oper & Operation.test) > 0) {
            this.env.test = true;
        }

        if ((oper & Operation.serve) > 0) {
            this.env.serve = true;
        }

        if ((oper & Operation.e2e) > 0) {
            this.env.e2e = true;
        }
    }

    /**
     *load config
     *
     *@param {ITaskConfig} cfg
     *
     *@memberof TaskContext
     */
    setConfig(cfg: ITaskConfig) {
        if (!cfg) {
            return;
        }
        if (cfg.env) {
            this.env = cfg.env = _.extend({}, this.env || {}, cfg.env);
            this.oper = currentOperation(this.env);
        }
        if (cfg.oper) {
            this.oper = cfg.oper;
            this.setEnvViaOperate(this.oper);
        }
        this.globals = cfg.globals || globals;
        if (cfg.option) {
            this.option = cfg.option = _.extend({}, this.option || {}, cfg.option);
        }
        this.cfg = _.extend(this.cfg, cfg);
    }

    /**
     *get config.
     *
     *@returns {ITaskConfig}
     *
     *@memberof TaskContext
     */
    getConfig(): ITaskConfig {
        return this.cfg || {};
    }

    /**
     *add sub ITaskContext
     *
     *@param {ITaskContext} context
     *
     *@memberOf ITaskContext
     */
    add(context: ITaskContext): void {
        context.parent = this;
        this.children.push(context);
    }
    /**
     *remove sub ITaskContext.
     *
     *@param {ITaskContext} [context]
     *
     *@memberOf ITaskContext
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
     *find sub context via express.
     *
     *@template T
     *@param {(T | Express<T, boolean>)} express
     *@param {Mode} [mode]
     *@returns {T}
     *@memberof TaskContext
     */
    find<T extends ITaskContext>(express: T | Express<T, boolean>, mode?: Mode): T {
        let context: ITaskContext;
        this.each<T>(item => {
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
        return context as T;
    }

    /**
     *filter items.
     *
     *@template T
     *@param {(Express<T, void | boolean>)} express
     *@param {Mode} [mode]
     *@returns {ITaskContext[]}
     *@memberof TaskContext
     */
    filter<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode): T[] {
        let contexts: ITaskContext[] = [];
        this.each<T>(item => {
            if (express(item)) {
                contexts.push(item);
            }
        }, mode);
        return contexts as T[];
    }
    /**
     *find parent context via express.
     *
     *@param {(ITaskContext | Express<ITaskContext, boolean>)} express
     *@param {Mode} [mode] {enum:['route','children', traverse']} default traverse.
     *
     *@memberOf ITaskContext
     */
    each<T extends ITaskContext>(express: Express<T, void | boolean>, mode?: Mode) {
        mode = mode || Mode.traverse;
        let r;
        switch (mode) {
            case Mode.route:
                r = this.route(express);
                break;
            case Mode.children:
                r = this.eachChildren(express);
                break;

            case Mode.traverse:
                r = this.trans(express);
                break;
            default:
                r = this.trans(express);
                break;
        }
        return r;
    }

    /**
     * map context.
     *
     *@template T
     *@param {Express<ITaskContext, T>} express
     *@param {Mode} [mode]
     *@param {Express<ITaskContext, boolean>} [filter]
     *@returns {T[]}
     *
     *@memberof TaskContext
     */
    map<T>(express: Express<ITaskContext, T>, mode?: Mode, filter?: Express<ITaskContext, boolean>): T[] {
        let arr: T[] = []
        this.each((ctx) => {
            if (filter) {
                if (filter(ctx)) {
                    arr.push(express(ctx));
                }
            } else {
                arr.push(express(ctx));
            }
        }, mode);
        return arr;
    }

    eachChildren(express: Express<ITaskContext, void | boolean>) {
        _.each(this.children, item => {
            return express(item);
        });
    }

    /**
     *do express work in routing.
     *
     *@param {Express<ITaskContext, void | boolean>} express
     *
     *@memberOf ITaskContext
     */
    route(express: Express<ITaskContext, void | boolean>) {
        if (!express(this)) {
            return false;
        };
        if (this.parent && this.parent.route) {
            return this.parent.route(express);
        }
    }
    /**
     *translate all sub context to do express work.
     *
     *@param {Express<ITaskContext, void | boolean>} express
     *
     *@memberOf ITaskContext
     */
    trans(express: Express<ITaskContext, void | boolean>) {
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

    findTasks(module: string | Object, match?: ITaskInfo): Promise<ITask[]> {
        let ctx = this;
        return findTasksInModule(module, _.extend({ oper: ctx.oper }, match || {}), this);
    }

    findTasksInDir(dirs: TaskSource, match?: ITaskInfo): Promise<ITask[]> {
        let ctx = this;
        return findTasksInDir(ctx.to(dirs), _.extend({ oper: ctx.oper }, match || {}), this);
    }

    findTaskDefine(module: string | Object): Promise<ITaskDefine> {
        return findTaskDefineInModule(module);
    }

    findTaskDefineInDir(dirs: TaskSource): Promise<ITaskDefine> {
        return findTaskDefineInDir(this.to(dirs));
    }

    fileFilter(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]> {
        return files(express, filter, mapping);
    }


    /**
     *to Sequence.
     *
     *@param {ITask[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {Src[]}
     *
     *@memberof TaskContext
     */
    toSequence(tasks: ITask[], zipName?: ZipTaskName): Src[] {
        return toSequence(this.gulp, tasks, this, zipName);
    }

    /**
     *filter file in directory.  default implement in bindingConfig.
     *
     *@param {Gulp} gulp
     *@param {Src[]} tasks
     *@returns {Promise<any>}
     *
     *@memberOf ITaskContext
     */
    runSequence(tasks: Src[]): Promise<any> {
        return runSequence(this.gulp, tasks);
    }

    /**
     *run task sequence in this context.
     *
     *@param {(ITask[] | Promise<ITask[]>)} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {Promise<any>}
     *
     *@memberof TaskContext
     */
    runTaskSequence(tasks: ITask[] | Promise<ITask[]>, zipName?: ZipTaskName): Promise<any> {
        return runTaskSequence(this.gulp, tasks, this, zipName);
    }

    /**
     *zip task sequence.
     *
     *@param {Src[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {string}
     *
     *@memberof ITaskContext
     */
    zipSequence(tasks: Src[], zipName?: ZipTaskName): string {
        return zipSequence(this.gulp, tasks, this, zipName);
    }

    /**
     *flattenSequence in this context.
     *
     *@param {Src[]} tasks
     *@param {ZipTaskName} [zipName]
     *@returns {string[]}
     *
     *@memberof ITaskContext
     */
    flattenSequence(tasks: Src[], zipName?: ZipTaskName): string[] {
        return flattenSequence(this.gulp, tasks, this, zipName);
    }


    /**
     *dynamic generate tasks.  default implement in bindingConfig.
     *
     *@param {(IDynamicTaskOption | IDynamicTaskOption[])} tasks
     *@param {ITaskInfo} [match]
     *@returns {ITask[]}
     *
     *@memberOf ITaskContext
     */
    generateTask(tasks: IDynamicTaskOption | IDynamicTaskOption[], match?: ITaskInfo): ITask[] {
        let ctx = this;
        let gtask = generateTask(tasks, _.extend({ oper: ctx.oper }, match || {}), this);
        this.taskseq = this.taskseq.concat(gtask);
        return this.taskseq;
    }

    /**
     *add task result to task sequence. default implement in bindingConfig.
     *
     *@param {Src[]} sequence  task sequence.
     *@param {ITaskInfo} task
     *@returns {Src[]}
     *
     *@memberOf ITaskContext
     */
    addToSequence(sequence: Src[], task: ITaskInfo): Src[] {
        if (this.cfg.addToSequence) {
            return this.cfg.addToSequence(sequence, task);
        }
        return addToSequence(sequence, task, this);
    }

    getRootPath() {
        let root: string;
        if (this.env && this.env.root) {
            root = this.env.root
        } else {
            this.route(c => {
                if (c.env && c.env.root) {
                    root = this.env.root;
                    return false;
                }
                return true;
            });
        }
        return root;
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
        return absoluteSrc(this.getRootPath(), src);
    }

    toRootPath(pathstr: string): string {
        return absolutePath(this.getRootPath(), pathstr);
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
        return (toPath ? path.relative(basePath, toPath) : basePath).replace(/\\/g, '/'); // .replace(/^\//g, '');
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

    setup(): Promise<Src[]> {

        if (this.option.oper && (this.oper & this.option.oper) <= 0) {
            this.sequence = null;
            return Promise.resolve(this.sequence);
        } else {
            return Promise.all<any>(
                [
                    this.setupTasks(),
                    ...this.map(ctx => {
                        return ctx.setup()
                            .then(seq => {
                                return ctx;
                            });
                    }, Mode.children)
                ])
                .then(srcs => {
                    let opt = this.option as IAsserts;
                    let tseq = srcs.shift() as Src[];
                    let ordertask = sortOrder(<ITaskContext[]>srcs, ctx => ctx.option.order, this);

                    let subseq: Src[] = [];
                    _.each(ordertask, (t, idx) => {
                        if (_.isArray(t)) {
                            if (t.length > 0) {
                                let ptasks = _.filter(_.map(t, it => this.zipSequence(<Src[]>it.getRunSequence())), it => !!it);
                                if (ptasks.length > 0) {
                                    subseq.push(ptasks);
                                }
                            }
                        } else {
                            let tk = this.zipSequence(t.getRunSequence());
                            tk && subseq.push(tk);
                        }
                    });

                    // let children = this.zipSequence(subseq, (name, runway) => this.subTaskName(name, (runway === RunWay.sequence ? '-sub-seq' : '-sub-paral')));
                    subseq = this.flattenSequence(subseq);
                    tseq = this.flattenSequence(tseq);
                    if (tseq.length > 0) {
                        tseq = opt.runWay === RunWay.parallel ? [this.flattenSequence(tseq)] : this.flattenSequence(tseq);
                        if (subseq && subseq.length > 0) {
                            if (opt.nodeSequence === NodeSequence.after) {
                                tseq.splice(0, 0, ...subseq);
                            } else {
                                tseq.push(...subseq);
                            }
                        }
                    } else {
                        tseq = subseq;
                    }

                    this.sequence = tseq;
                    return this.sequence;
                });
        }
    }

    getRunSequence(): Src[] {
        return this.sequence || [];
    }

    setupTasks(): Src[] | Promise<Src[]> {
        return this.toSequence(this.taskseq);
    }

    addTask(...task: ITask[]) {
        this.taskseq.push(...task);
    }

    removeTask(task: ITask): ITask[] | Promise<ITask[]> {
        let idx = this.taskseq.indexOf(task);
        if (idx >= 0 && idx < this.taskseq.length) {
            return this.taskseq.splice(idx, 1);
        }

        return [];
    }

    /**
     *run task in this context.
     *
     *@returns {Promise<any>}
     *
     *@memberof TaskContext
     */
    run(): Promise<any> {
        if (this.env.help) {
            return Promise.resolve(this.help())
        } else {
            return this.setup()
                .then(tseq => {
                    let opt = this.option as IAsserts;
                    if (opt.runWay === RunWay.parallel) {
                        return this.runSequence([this.flattenSequence(tseq)]);
                    } else {
                        return this.runSequence(tseq);
                    }
                });
        }
    }

    help() {
        this.cfg.printHelp && this.cfg.printHelp(_.isBoolean(this.env.help) ? '' : this.env.help);
    }

    tasks(express?: (item: ITask) => boolean): ITask[] {
        return express ? _.filter(this.taskseq, express) : this.taskseq;
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
 *get current env Operation.
 *
 *@export
 *@param {EnvOption} env
 *@returns
 */
function currentOperation(env: IEnvOption) {
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
 *get assert source.
 *
 *@param {IAssertDist} assert
 *@param {Operation} oper
 *@returns
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
 *get dist.
 *
 *@param {IAssertDist} ds
 *@param {ITaskContext} ctx
 *@returns
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
 *filter fileName in directory.
 *
 *@export
 *@param {string} directory
 *@param {((fileName: string) => boolean)} [express]
 *@returns {string[]}
 */
function files(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]> {
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
 *task src, string or array string.
 *
 *@export
 *@param {TaskSource} src
 *@param {Operation} oper runtime Operation
 *@param {IEnvOption} [env]
 *@returns
 */
function taskSourceVal(src: TaskSource, ctx: ITaskContext) {
    return _.isFunction(src) ? src(ctx) : (src || '');
}

/**
 *task string.
 *
 *@export
 *@param {TaskString} name
 *@param {ITaskContext} ctx
 *@returns
 */
function taskStringVal(name: TaskString, ctx: ITaskContext) {
    return _.isFunction(name) ? name(ctx) : (name || '');
}
