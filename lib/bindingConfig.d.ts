import { IEnvOption, Operation, ITaskConfig } from './TaskConfig';
/**
 * binding Config to implement default func.
 *
 * @export
 * @param {TaskConfig} cfg
 * @returns {TaskConfig}
 */
export declare function bindingConfig(cfg: ITaskConfig): ITaskConfig;
/**
 * get current env Operation.
 *
 * @export
 * @param {EnvOption} env
 * @returns
 */
export declare function currentOperation(env: IEnvOption, cfg?: ITaskConfig): Operation;
