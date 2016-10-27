/// <reference types="chai" />
import 'reflect-metadata';
import { Operation } from './TaskConfig';
export declare function task(oper?: Operation, order?: number, name?: string): {
    (target: Function): void;
    (target: Object, targetKey: string | symbol): void;
};
export declare function getTask(target: Object, type: string): any;
export declare function taskconfig(oper?: Operation): {
    (target: Function): void;
    (target: Object, targetKey: string | symbol): void;
};
export declare function getTaskconfig(target: Object, oper?: Operation): any;
export declare function taskloader(oper?: Operation): {
    (target: Function): void;
    (target: Object, targetKey: string | symbol): void;
};
export declare function getTaskloader(target: Object, oper?: Operation): any;
export declare function taskdefine(constructor: Function): {
    (target: Function): void;
    (target: Object, targetKey: string | symbol): void;
};
export declare function findTaskDefine(target: any): any;
