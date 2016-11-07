import * as _ from 'lodash';
import { TaskSource, TaskString, Operation, ITaskInfo } from './TaskConfig';
import { readdirSync, lstatSync } from 'fs';
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
        tinfo.oper = (tinfo.oper || 0) | Operation.watch;
    }
    if (tinfo.e2e) {
        tinfo.oper = (tinfo.oper || 0) | Operation.e2e;
    }
    if (tinfo.test) {
        tinfo.oper = (tinfo.oper || 0) | Operation.test;
    }

    tinfo.oper = tinfo.oper || def;
    return tinfo;
}
function convertMatchOper(match: ITaskInfo) {
    if ((match.oper & Operation.test) > 0 && (match.oper & Operation.release) <= 0) {
        match.oper = match.oper | Operation.build;
    }
    if ((match.oper & Operation.e2e) > 0 && (match.oper & Operation.release) <= 0) {
        match.oper = match.oper | Operation.build;
    }
    if ((match.oper & Operation.deploy) > 0) {
        match.oper = match.oper | Operation.test | Operation.e2e;
    }
    if ((match.oper & Operation.release) > 0) {
        match.oper = match.oper | Operation.test;
    }

    return match;
}

export function matchOper(tinfo: ITaskInfo, match: ITaskInfo) {

    match = convertOper(match, Operation.build);
    tinfo = convertOper(tinfo);

    if (match.match) {
        return match.match(tinfo);
    } else if (tinfo.match) {
        return tinfo.match(match);
    } else {
        match = convertMatchOper(match);
    }

    if ((tinfo.oper & match.oper) <= 0) {
        return false;
    }
    if ((match.oper & Operation.watch) <= 0 && (tinfo.oper & Operation.watch) > 0) {
        return false;
    }
    if ((match.oper & Operation.serve) <= 0 && (tinfo.oper & Operation.serve) > 0) {
        return false;
    }
    if ((match.oper & Operation.test) <= 0 && (tinfo.oper & Operation.test) > 0) {
        return false;
    }
    if ((match.oper & Operation.e2e) <= 0 && (tinfo.oper & Operation.e2e) > 0) {
        return false;
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
