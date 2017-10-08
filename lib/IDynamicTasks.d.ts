import { IDynamicTaskOption } from './IDynamicTaskOption';
/**
 * dynamic tasks
 *
 * @export
 * @interface ITasks
 */
export interface IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}
