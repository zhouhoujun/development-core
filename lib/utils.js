"use strict";

var _ = require('lodash');
var TaskConfig_1 = require('./TaskConfig');
var path = require('path');
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
function sortOrder(sequence, orderBy, ctx) {
    var forceSequence = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var parall = {};
    var rseq = _.orderBy(_.filter(sequence, function (t) {
        return t;
    }), function (t) {
        if (_.isArray(t)) {
            return 0.5;
        } else {
            var order = orderBy(t);
            if (_.isFunction(order)) {
                order = order(sequence.length, ctx);
            } else if (!_.isNumber(order) && !order) {
                order = 0.5;
            }
            var orderVal = void 0;
            if (_.isNumber(order)) {
                orderVal = order;
            } else {
                if (!forceSequence && order.runWay === TaskConfig_1.RunWay.parallel) {
                    parall[order.value] = parall[order.value] || [];
                    parall[order.value].push(t);
                }
                orderVal = order.value;
            }
            if (orderVal > 1) {
                return orderVal % sequence.length / sequence.length;
            } else if (orderVal < 0) {
                orderVal = 0;
            }
            return orderVal;
        }
    });
    if (!forceSequence) {
        _.each(_.values(parall), function (pals) {
            var first = _.first(pals);
            rseq.splice(rseq.indexOf(first), pals.length, pals);
        });
    }
    return rseq;
}
exports.sortOrder = sortOrder;
function contains(arr1, arr2) {
    return arr2.some(function (arr2Item) {
        return arr1.indexOf(arr2Item) >= 0;
    });
}
/**
 * convert old version Operation to new version Operation
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {any} [def=Operation.default]
 * @returns
 */
function convertOper(decor) {
    var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TaskConfig_1.Operation.default;

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
exports.convertOper = convertOper;
function convertMatchOper(match) {
    if (match.oper & TaskConfig_1.Operation.test && !(match.oper & TaskConfig_1.Operation.release)) {
        match.oper = match.oper | TaskConfig_1.Operation.build;
    }
    if (match.oper & TaskConfig_1.Operation.e2e && !(match.oper & TaskConfig_1.Operation.release)) {
        match.oper = match.oper | TaskConfig_1.Operation.build;
    }
    if (match.oper & TaskConfig_1.Operation.deploy) {
        match.oper = match.oper | TaskConfig_1.Operation.test | TaskConfig_1.Operation.e2e;
    }
    if (match.oper & TaskConfig_1.Operation.release) {
        match.oper = match.oper | TaskConfig_1.Operation.test;
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
function someOper(oper1, oper2) {
    return (oper1 & oper2) > 0;
}
exports.someOper = someOper;
/**
 * match
 *
 * @export
 * @param {ITaskDecorator} tinfo
 * @param {ITaskDecorator} match
 * @param {ITaskContext} [ctx]
 * @returns
 */
function matchCompare(tinfo, match, ctx) {
    if (ctx) {
        return ctx.matchCompare(tinfo, match);
    } else {
        if (!matchTaskInfo(tinfo, match)) {
            return false;
        }
        if (!matchTaskGroup(tinfo, match)) {
            return false;
        }
        return true;
    }
}
exports.matchCompare = matchCompare;
/**
 * match task via task info.
 *
 * @export
 * @param {ITaskDecorator} decor
 * @param {ITaskDecorator} match
 * @returns
 */
function matchTaskInfo(decor, match) {
    match = convertOper(match, TaskConfig_1.Operation.build);
    decor = convertOper(decor);
    if (match.match) {
        return match.match(decor);
    } else if (decor.match) {
        return decor.match(match);
    } else {
        match = convertMatchOper(match);
    }
    var eq = decor.oper & match.oper;
    // console.log('eq------->:', eq);
    if (eq <= 0) {
        return false;
    }
    if (decor.oper & TaskConfig_1.Operation.watch) {
        if ((match.oper & TaskConfig_1.Operation.watch) <= 0) {
            return false;
        } else {
            if (eq <= TaskConfig_1.Operation.watch) {
                return false;
            }
        }
    }
    if (decor.oper & TaskConfig_1.Operation.serve) {
        if (!(match.oper & TaskConfig_1.Operation.serve)) {
            return false;
        } else {
            if (eq <= TaskConfig_1.Operation.serve) {
                return false;
            }
        }
    }
    if (decor.oper & TaskConfig_1.Operation.test) {
        if (!(match.oper & TaskConfig_1.Operation.test)) {
            return false;
        } else {
            if (eq <= TaskConfig_1.Operation.test) {
                return false;
            }
        }
    }
    if (decor.oper & TaskConfig_1.Operation.e2e) {
        if (!(match.oper & TaskConfig_1.Operation.e2e)) {
            return false;
        } else {
            if (eq <= TaskConfig_1.Operation.e2e) {
                return false;
            }
        }
    }
    return true;
}
function matchTaskGroup(tinfo, match) {
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
function absolutePath(root, pathstr) {
    if (!root || path.isAbsolute(pathstr)) {
        return pathstr;
    }
    return path.join(root, pathstr);
}
exports.absolutePath = absolutePath;
/**
 * convert src to absolute path src.
 *
 * @export
 * @param {string} root
 * @param {Src} src
 * @returns {Src}
 */
function absoluteSrc(root, src) {
    if (_.isString(src)) {
        return prefixSrc(root, src);
    } else {
        return _.map(src, function (p) {
            return prefixSrc(root, p);
        });
    }
}
exports.absoluteSrc = absoluteSrc;
function prefixSrc(root, strSrc) {
    var prefix = '';
    if (/^!/.test(strSrc)) {
        prefix = '!';
        strSrc = strSrc.substring(1, strSrc.length);
    }
    return prefix + absolutePath(root, strSrc);
}
//# sourceMappingURL=sourcemaps/utils.js.map
