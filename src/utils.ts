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

export function matchTaskGroup(tk: ITaskInfo, match: ITaskInfo): boolean {
    if (tk.group && match && match.group) {
        if (_.isString(match.group)) {
            if (_.isString(tk.group) && tk.group !== match.group) {
                return false;
            } else if (_.isArray(tk.group) && tk.group.indexOf(match.group) < 0) {
                return false;
            }
        } else if (_.isArray(match.group)) {
            if (_.isString(tk.group) && match.group.indexOf(tk.group) < 0) {
                return false;
            } else if (_.isArray(tk.group) && !contains(tk.group, match.group)) {
                return false;
            }
        }
    } else if (tk.group) {
        return false;
    } else if (match && match.group) {
        return false;
    }

    return true;
}
