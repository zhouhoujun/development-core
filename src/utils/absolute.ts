import * as path from 'path';
import * as _ from 'lodash';
import { Src } from '../types';

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
