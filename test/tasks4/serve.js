"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},__decorate=function(e,t,r,n){var o,s=arguments.length,a=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"===("undefined"==typeof Reflect?"undefined":_typeof(Reflect))&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,n);else for(var i=e.length-1;i>=0;i--)(o=e[i])&&(a=(s<3?o(a):s>3?o(t,r,a):o(t,r))||a);return s>3&&a&&Object.defineProperty(t,r,a),a},__metadata=function(e,t){if("object"===("undefined"==typeof Reflect?"undefined":_typeof(Reflect))&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)},_=require("lodash"),src_1=require("../../src"),StartService=function(){function e(t){_classCallCheck(this,e),this.info=t}return _createClass(e,[{key:"getInfo",value:function(){return this.info.name=this.info.name||"serve",this.info}},{key:"setup",value:function(e,t){var r=e.option,n=null;r.serverFiles&&(n=_.isFunction(r.serverFiles)?r.serverFiles(e):r.serverFiles),n=n||[];var o=e.getDist(this.getInfo()),s=null;s=r.serverBaseDir?_.isFunction(r.serverBaseDir)?r.serverBaseDir(e):r.serverBaseDir:o,n.push(o+"/**/*");var a={server:{baseDir:s},open:!0,port:process.env.PORT||3e3,files:n};r.browsersync&&(a=_.extend(a,_.isFunction(r.browsersync)?r.browsersync(e,a):r.browsersync));var i=e.subTaskName(this.info);return t.task(i,function(e){e()}),i}}]),e}();StartService=__decorate([src_1.task({order:function(e,t){return t.env.test?{value:.25,runWay:src_1.RunWay.parallel}:1},oper:src_1.Operation.default|src_1.Operation.serve}),__metadata("design:paramtypes",[Object])],StartService),exports.StartService=StartService;
//# sourceMappingURL=../sourcemaps/tasks3/serve.js.map
