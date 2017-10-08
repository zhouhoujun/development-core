import * as _ from 'lodash';
import { ITaskContext } from '../ITaskContext';
import { ITaskInfo } from '../ITask';
import { Operation } from '../Operation';
import { convertOper } from './oper';
import { ITaskDecorator } from '../ITaskDecorator';


/**
 * match
 *
 * @export
 * @param {ITaskContext} ctx
 * @param {ITaskDecorator} tinfo
 * @param {ITaskDecorator} match
 * @returns
 */
export function matchCompare(ctx: ITaskContext, tinfo: ITaskDecorator, match: ITaskDecorator) {

    if (!matchTaskInfo(ctx, tinfo, match)) {
        return false;
    }

    if (!matchTaskGroup(tinfo, match)) {
        return false;
    }
    return true;

}

function contains(arr1: string[], arr2: string[]) {
    return arr2.some(arr2Item => arr1.indexOf(arr2Item) >= 0);
}



function convertMatchOper(ctx: ITaskContext, match: ITaskDecorator) {
    let matchOper = ctx.to(match.oper);
    if ((matchOper & Operation.test) && !(matchOper & Operation.release)) {
        matchOper = matchOper | Operation.build;
    }
    if ((matchOper & Operation.e2e) && !(matchOper & Operation.release)) {
        matchOper = matchOper | Operation.build;
    }
    if (matchOper & Operation.deploy) {
        matchOper = matchOper | Operation.test | Operation.e2e;
    }
    if (matchOper & Operation.release) {
        matchOper = matchOper | Operation.test;
    }
    match.oper = matchOper;
    return match;
}

/**
 * match task via task info.
 *
 * @param {ITaskContext} ctx
 * @param {ITaskDecorator} decor
 * @param {ITaskDecorator} match
 * @returns
 */
function matchTaskInfo(ctx: ITaskContext, decor: ITaskDecorator, match: ITaskDecorator) {

    match = convertOper(match, Operation.build);
    decor = convertOper(decor);

    if (match.match) {
        return match.match(decor);
    } else if (decor.match) {
        return decor.match(match);
    } else {
        match = convertMatchOper(ctx, match);
    }

    let decorOper = ctx.to(decor.oper);
    let matchOper = ctx.to(match.oper);
    let eq = decorOper & matchOper;
    // console.log('eq------->:', eq);
    if (eq <= 0) {
        return false;
    }

    if (decorOper & Operation.watch) {
        if ((matchOper & Operation.watch) <= 0) {
            return false;
        } else {
            if (eq <= Operation.watch) {
                return false;
            }
        }
    }

    if (decorOper & Operation.serve) {
        if (!(matchOper & Operation.serve)) {
            return false;
        } else {
            if (eq <= Operation.serve) {
                return false;
            }
        }
    }

    if (decorOper & Operation.test) {
        if (!(matchOper & Operation.test)) {
            return false;
        } else {
            if (eq <= Operation.test) {
                return false;
            }
        }
    }

    if (decorOper & Operation.e2e) {
        if (!(matchOper & Operation.e2e)) {
            return false;
        } else {
            if (eq <= Operation.e2e) {
                return false;
            }
        }
    }

    return true;
}

function matchTaskGroup(tinfo: ITaskInfo, match: ITaskInfo): boolean {
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

