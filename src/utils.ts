import * as _ from 'lodash';
import { TaskSource, TaskString, Operation, ITaskInfo, Src } from './TaskConfig';
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

export function taskSourceVal(src: TaskSource, oper?: Operation) {
    return _.isFunction(src) ? src(oper) : (src || '');
}

export function taskStringVal(name: TaskString, oper?: Operation) {
    return _.isFunction(name) ? name(oper) : (name || '');
}


function contains(arr1: string[], arr2: string[]) {
    return arr2.some(arr2Item => arr1.indexOf(arr2Item) >= 0);
}


/**
 * convert old version Operation to new version Operation
 * 
 * @export
 * @param {ITaskInfo} tinfo
 * @param {any} [def=Operation.default]
 * @returns
 */
export function convertOper(tinfo: ITaskInfo, def = Operation.default) {
    tinfo = tinfo || {};
    if (tinfo.watch) {
        tinfo.oper = (tinfo.oper || def) | Operation.watch;
    }
    if (tinfo.e2e) {
        tinfo.oper = (tinfo.oper || def) | Operation.e2e;
    }
    if (tinfo.test) {
        tinfo.oper = (tinfo.oper || def) | Operation.test;
    }

    tinfo.oper = tinfo.oper || def;
    return tinfo;
}
function convertMatchOper(match: ITaskInfo) {
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
 * @param {ITaskInfo} tinfo
 * @param {ITaskInfo} match
 * @returns
 */
export function matchTaskInfo(tinfo: ITaskInfo, match: ITaskInfo) {

    match = convertOper(match, Operation.build);
    tinfo = convertOper(tinfo);

    if (match.match) {
        return match.match(tinfo);
    } else if (tinfo.match) {
        return tinfo.match(match);
    } else {
        match = convertMatchOper(match);
    }

    let eq = tinfo.oper & match.oper;
    // console.log('eq------->:', eq);
    if (eq <= 0) {
        return false;
    }

    if (tinfo.oper & Operation.watch) {
        if ((match.oper & Operation.watch) <= 0) {
            return false;
        } else {
            if (eq <= Operation.watch) {
                return false;
            }
        }
    }

    if (tinfo.oper & Operation.serve) {
        if (!(match.oper & Operation.serve)) {
            return false;
        } else {
            if (eq <= Operation.serve) {
                return false;
            }
        }
    }

    if (tinfo.oper & Operation.test) {
        if (!(match.oper & Operation.test)) {
            return false;
        } else {
            if (eq <= Operation.test) {
                return false;
            }
        }
    }

    if (tinfo.oper & Operation.e2e) {
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
        return absolutePath(root, src)
    } else {
        return _.map(src, p => absolutePath(root, p));
    }
}
