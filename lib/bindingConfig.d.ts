import { IEnvOption, Operation, ITaskContext, ITaskConfig } from './TaskConfig';
/**
 * binding Config to implement default func.
 *
 * @export
 * @param {ITaskConfig} cfg
 * @returns {ITaskContext}
 */
export declare function bindingConfig(cfg: ITaskConfig): ITaskContext;
/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
export declare function currentOperation(env: IEnvOption): Operation;
