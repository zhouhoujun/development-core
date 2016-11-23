import * as _ from 'lodash';
import { IMap, RunWay, TaskSource, TaskString, Operation, Order, ITaskDecorator, ITaskInfo, Src, ITaskContext } from './TaskConfig';
import { readdirSync, lstatSync } from 'fs';
import * as path from 'path';
/**
 * filter fileName in directory.
 * 
 * @export
 * @param {string} directory
 * @param {((fileName: string) => boolean)} [express]
 * @returns {string[]}
 */
export function files(directory: string, express?: ((fileName: string) => boolean)): string[] {
    let res: string[] = [];
    express = express || ((fn) => true);
    _.each(readdirSync(directory), fname => {
        let filePn = directory + '/' + fname;
        var fst = lstatSync(filePn);
        if (!fst.isDirectory()) {
            if (express(filePn)) {
                res.push(filePn)
            }
        } else {
            res = res.concat(files(filePn, express))
        }
    });
    return res;
}

/**
 * sorting via order.
 * 
 * @export
 * @template T
 * @param {T[]} sequence
 * @param {(item: T) => Order} orderBy
 * @param {ITaskContext} ctx
 * @param {boolean} [forceSequence=false]
 * @returns {(Array<T | T[]>)}
 */
export function sortOrder<T>(sequence: T[], orderBy: (item: T) => Order, ctx: ITaskContext, forceSequence = false): Array<T | T[]> {
    let parall: IMap<T[]> = {};
    let rseq: Array<T | T[]> = _.orderBy(_.filter(sequence, t => t), (t: T) => {
        if (_.isArray(t)) {
            return 0.5;
        } else {
            let order = orderBy(t);
            if (_.isFunction(order)) {
                order = order(sequence.length, ctx);
            } else if (!_.isNumber(order) && !order) {
                order = 0.5;
            }

            let orderVal: number;
            if (_.isNumber(order)) {
                orderVal = order;
            } else {
                if (!forceSequence && order.runWay === RunWay.parallel) {
                    parall[order.value] = parall[order.value] || [];
                    parall[order.value].push(t);
                }
                orderVal = order.value;
            }

            if (orderVal > 1) {
                return (orderVal % sequence.length) / sequence.length;
            } else if (orderVal < 0) {
                orderVal = 0;
            }

            return orderVal;
        }
    });
    if (!forceSequence) {
        _.each(_.values(parall), pals => {
            let first = _.first(pals);
            rseq.splice(rseq.indexOf(first), pals.length, pals);
        });
    }

    return rseq;
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


function contains(arr1: string[], arr2: string[]) {
    return arr2.some(arr2Item => arr1.indexOf(arr2Item) >= 0);
}


/**
 * convert old version Operation to new version Operation
 * 
 * @export
 * @param {ITaskDecorator} decor
 * @param {any} [def=Operation.default]
 * @returns
 */
export function convertOper(decor: ITaskDecorator, def = Operation.default) {
    decor = decor || {};
    // // todo  compatibility
    // if (decor['watch']) {
    //     decor.oper = (decor.oper || def) | Operation.watch;
    // }
    // if (decor['e2e']) {
    //     decor.oper = (decor.oper || def) | Operation.e2e;
    // }
    // if (decor['test']) {
    //     decor.oper = (decor.oper || def) | Operation.test;
    // }
    // // ----

    decor.oper = decor.oper || def;
    return decor;
}

function convertMatchOper(match: ITaskDecorator) {
    if ((match.oper & Operation.test) && !(match.oper & Operation.release)) {
        match.oper = match.oper | Operation.build;
    }
    if ((match.oper & Operation.e2e) && !(match.oper & Operation.release)) {
        match.oper = match.oper | Operation.build;
    }
    if (match.oper & Operation.deploy) {
        match.oper = match.oper | Operation.test | Operation.e2e;
    }
    if (match.oper & Operation.release) {
        match.oper = match.oper | Operation.test;
    }

    return match;
}


/**
 * has some oper samed.
 * 
 * @export
 * @param {Operation} oper1
 * @param {Operation} oper2
 * @returns
 */
export function someOper(oper1: Operation, oper2: Operation) {
    return (oper1 & oper2) > 0;
}

/**
 * match task via task info.
 * 
 * @export
 * @param {ITaskDecorator} decor
 * @param {ITaskDecorator} match
 * @returns
 */
export function matchTaskInfo(decor: ITaskDecorator, match: ITaskDecorator) {

    match = convertOper(match, Operation.build);
    decor = convertOper(decor);

    if (match.match) {
        return match.match(decor);
    } else if (decor.match) {
        return decor.match(match);
    } else {
        match = convertMatchOper(match);
    }

    let eq = decor.oper & match.oper;
    // console.log('eq------->:', eq);
    if (eq <= 0) {
        return false;
    }

    if (decor.oper & Operation.watch) {
        if ((match.oper & Operation.watch) <= 0) {
            return false;
        } else {
            if (eq <= Operation.watch) {
                return false;
            }
        }
    }

    if (decor.oper & Operation.serve) {
        if (!(match.oper & Operation.serve)) {
            return false;
        } else {
            if (eq <= Operation.serve) {
                return false;
            }
        }
    }

    if (decor.oper & Operation.test) {
        if (!(match.oper & Operation.test)) {
            return false;
        } else {
            if (eq <= Operation.test) {
                return false;
            }
        }
    }

    if (decor.oper & Operation.e2e) {
        if (!(match.oper & Operation.e2e)) {
            return false;
        } else {
            if (eq <= Operation.e2e) {
                return false;
            }
        }
    }

    return true;
}

export function matchTaskGroup(tinfo: ITaskInfo, match: ITaskInfo): boolean {
    if (tinfo.group && match && match.group) {
        if (_.isString(match.group)) {
            if (_.isString(tinfo.group) && tinfo.group !== match.group) {
                return false;
            } else if (_.isArray(tinfo.group) && tinfo.group.indexOf(match.group) < 0) {
                return false;
            }
        } else if (_.isArray(match.group)) {
            if (_.isString(tinfo.group) && match.group.indexOf(tinfo.group) < 0) {
                return false;
            } else if (_.isArray(tinfo.group) && !contains(tinfo.group, match.group)) {
                return false;
            }
        }
    } else if (tinfo.group) {
        return false;
    } else if (match && match.group) {
        return false;
    }

    return true;
}

/**
 * convert path to absolute path.
 * 
 * @export
 * @param {string} root
 * @param {string} pathstr
 * @returns {string}
 */
export function absolutePath(root: string, pathstr: string): string {
    if (!root || path.isAbsolute(pathstr)) {
        return pathstr;
    }
    return path.join(root, pathstr);
}

/**
 * convert src to absolute path src.
 * 
 * @export
 * @param {string} root
 * @param {Src} src
 * @returns {Src}
 */
export function absoluteSrc(root: string, src: Src): Src {
    if (_.isString(src)) {
        return prefixSrc(root, src);
    } else {
        return _.map(src, p => prefixSrc(root, p));
    }
}

function prefixSrc(root: string, strSrc: string): string {
    let prefix = '';
    if (/^!/.test(strSrc)) {
        prefix = '!';
        strSrc = strSrc.substring(1, strSrc.length);
    }
    return prefix + absolutePath(root, strSrc);
}
