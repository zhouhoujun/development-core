import * as _ from 'lodash';
import { TaskSource, TaskString, Operation } from './TaskConfig';
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
