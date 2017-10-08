import 'mocha';
import { expect } from 'chai';
import { Operation, createContext, ITaskInfo } from '../src';

import * as path from 'path';
let root = __dirname;

describe('sub task name', () => {


    it('no option name', () => {

        let ctx = createContext({
            env: { root: root },
            option: { src: 'src', dist: 'lib' }
        });


        expect(ctx.taskName('test')).eq('test');
        expect(ctx.taskName(<ITaskInfo>{ assert: { name: 'test' } })).eq('test');

    })

    it('with option name', () => {

        let ctx = createContext({
            env: { root: root },
            option: { name: 'appname', src: 'src', dist: 'lib' }
        });

        expect(ctx.taskName('test')).eq('appname-test');
        expect(ctx.taskName(<ITaskInfo>{ assert: { name: 'test' } })).eq('appname-test');
    })
});
