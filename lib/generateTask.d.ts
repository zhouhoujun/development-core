import { IDynamicTask, IEnvOption, Operation, Task } from './TaskConfig';
export declare function generateTask(tasks: IDynamicTask | IDynamicTask[], oper: Operation, env: IEnvOption): Task[];
