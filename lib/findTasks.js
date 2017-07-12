"use strict";function findTaskset(e,n,r,i){if(n)if(_.isFunction(n)){if(n.__task){var s=n.__task;if(s=_.isBoolean(s)?{}:s,!utils_1.matchCompare(i,s,r))return;if(e.has(n))return;var a=new n(s);a.setInfo&&a.setInfo(s),e.set(n,a)}else if(n.__dynamictask){var t=n.__dynamictask;if(!utils_1.matchCompare(i,t,r))return;if(e.has(n))return;var f=_.map((new n).tasks(),function(e){return e=_.extend(_.clone(t),e)});e.set(n,generateTask_1.generateTask(i,f,r))}}else _.isArray(n)?_.each(n,function(n){findTaskset(e,n,r,i)}):_.each(_.keys(n),function(s){s&&n[s]&&!/^[0-9]+$/.test(s)&&findTaskset(e,n[s],r,i)})}function findTaskMap(e,n,r,i){i=i||new Map,findTaskset(i,e,n,r);var s=[];return i.forEach(function(e){_.isArray(e)?s.push.apply(s,e):s.push(e)}),r&&r.addTask.apply(r,s),s}function findTasks(e,n,r){return findTaskMap(e,n,r)}function findTaskDefines(e){var n=[];if(!e)return n;if(_.isFunction(e)){if(e.__task_context){var r=new e;n.push(r)}}else _.isArray(e)?_.each(e,function(e){n.concat(findTaskDefines(e))}):_.each(_.keys(e),function(r){r&&e[r]&&!/^[0-9]+$/.test(r)&&(n=n.concat(findTaskDefines(e[r])))});return n}function findTaskDefine(e){var n;return e?(_.isFunction(e)?e.__task_context&&(n=new e):_.isArray(e)?_.each(e,function(e){return!n&&(n=findTaskDefine(e),!0)}):_.each(_.keys(e),function(r){return!n&&(!(r&&e[r]&&!/^[0-9]+$/.test(r))||(n=findTaskDefine(e[r]),!0))}),n):null}function findTaskDefineInModule(e){var n;try{n=findTaskDefine(_.isString(e)?require(e):e)}catch(e){return Promise.reject(e)}return n?Promise.resolve(n):Promise.resolve(null)}function findTasksInModule(e,n,r){var i;try{i=_.isString(e)?findTasks(require(e),n,r):findTasks(e,n,r)}catch(e){return Promise.reject(e)}return Promise.resolve(i)}function findTaskDefineInDir(e){return Promise.race(_.map(_.isArray(e)?e:[e],function(e){return new Promise(function(n,r){if(fs_1.existsSync(e)){var i=requireDir(e,{duplicates:!0,camelcase:!0,recurse:!0});if(i){var s=findTaskDefine(i);s&&n(s)}}})}))}function findTasksInDir(e,n,r){var i=new Map;return Promise.all(_.map(_.isArray(e)?e:[e],function(e){console.log(chalk.grey("begin load task from dir"),chalk.cyan(e));try{var s=requireDir(e,{duplicates:!0,camelcase:!0,recurse:!0});return Promise.resolve(findTaskMap(s,n,r,i))}catch(e){return Promise.reject(e)}})).then(function(e){return _.flatten(e)})}Object.defineProperty(exports,"__esModule",{value:!0}),require("reflect-metadata");var _=require("lodash"),chalk=require("chalk"),generateTask_1=require("./generateTask"),utils_1=require("./utils"),fs_1=require("fs"),requireDir=require("require-dir");exports.findTasks=findTasks,exports.findTaskDefines=findTaskDefines,exports.findTaskDefine=findTaskDefine,exports.findTaskDefineInModule=findTaskDefineInModule,exports.findTasksInModule=findTasksInModule,exports.findTaskDefineInDir=findTaskDefineInDir,exports.findTasksInDir=findTasksInDir;
//# sourceMappingURL=sourcemaps/findTasks.js.map