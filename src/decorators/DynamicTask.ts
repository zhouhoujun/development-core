import { createClassDecorator, IClassDecorator, ClassMetadata } from 'type-autofac';
import { ITaskDecorator } from '../ITaskDecorator';

export interface DynamicTaskMetadata extends ITaskDecorator, ClassMetadata {

}

export const DynamicTask: IClassDecorator = createClassDecorator<DynamicTaskMetadata>('DynamicTask');
