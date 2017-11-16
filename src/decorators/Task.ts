import { createClassDecorator, IClassDecorator, ClassMetadata } from 'type-autofac';
import { ITaskDecorator } from '../ITaskDecorator';

export interface TaskMetadata extends ITaskDecorator, ClassMetadata {

}

export const Task: IClassDecorator = createClassDecorator<TaskMetadata>('Task');

