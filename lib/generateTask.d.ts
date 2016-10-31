import { IDynamicTask, IEnvOption, Operation, ITask } from './TaskConfig';
export declare function generateTask(tasks: IDynamicTask | IDynamicTask[], oper?: Operation, env?: IEnvOption): ITask[];
