import 'mocha';
import { expect } from 'chai';
import { Operation, bindingConfig, ITaskInfo } from '../src';

import * as path from 'path';
let root = __dirname;

describe('sub task name', () => {


    it('no option name', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root },
            option: { src: 'src', dist: 'lib' }
        });


        expect(ctx.subTaskName('test')).eq('test');
        expect(ctx.subTaskName(<ITaskInfo>{ assert: { name: 'test' } })).eq('test');

    })

    it('with option name', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root },
            option: { name: 'appname', src: 'src', dist: 'lib' }
        });

        expect(ctx.subTaskName('test')).eq('appname-test');
        expect(ctx.subTaskName(<ITaskInfo>{ assert: { name: 'test' } })).eq('appname-test');
    })
});
