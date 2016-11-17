"use strict";
/**
 * project development build operation.
 *
 * @export
 * @enum {number}
 */

(function (Operation) {
  /**
   * build compile project.
   */
  Operation[Operation["build"] = 1] = "build";
  /**
   * test project.
   */
  Operation[Operation["test"] = 2] = "test";
  /**
   * e2e test project.
   */
  Operation[Operation["e2e"] = 4] = "e2e";
  /**
   * release project.
   */
  Operation[Operation["release"] = 8] = "release";
  /**
   * release and deploy project.
   */
  Operation[Operation["deploy"] = 16] = "deploy";
  /**
   * clean task
   */
  Operation[Operation["clean"] = 32] = "clean";
  /**
   * serve task
   */
  Operation[Operation["serve"] = 64] = "serve";
  /**
   * watch task.
   */
  Operation[Operation["watch"] = 128] = "watch";
  /**
   * default operation.
   */
  Operation[Operation["default"] = 25] = "default";
  /**
   * define watch Operation (Operation.build | Operation.test | Operation.e2e | Operation.watch)
   */
  Operation[Operation["defaultWatch"] = 135] = "defaultWatch";
})(exports.Operation || (exports.Operation = {}));
var Operation = exports.Operation;
//# sourceMappingURL=sourcemaps/TaskConfig.js.map
