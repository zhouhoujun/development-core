import { createClassDecorator, IClassDecorator, ClassMetadata } from 'type-autofac';
import { ITaskDecorator } from '../ITaskDecorator';

export interface TaskDefineMetadata extends ClassMetadata {

}

export const TaskDefine: IClassDecorator = createClassDecorator<TaskDefineMetadata>('TaskDefine');

