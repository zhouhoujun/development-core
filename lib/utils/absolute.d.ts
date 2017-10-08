import { Src } from '../types';
/**
 * convert path to absolute path.
 *
 * @export
 * @param {string} root
 * @param {string} pathstr
 * @returns {string}
 */
export declare function absolutePath(root: string, pathstr: string): string;
/**
 * convert src to absolute path src.
 *
 * @export
 * @param {string} root
 * @param {Src} src
 * @returns {Src}
 */
export declare function absoluteSrc(root: string, src: Src): Src;
