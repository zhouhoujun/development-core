import 'mocha';
import { expect } from 'chai';
import * as gulp from 'gulp';
import { findTasks, Operation, ITask, ITaskDefine, bindingConfig, toSequence, findTaskDefine } from '../src';


describe('decorator', () => {

    let model: any;

    beforeEach(() => {
        model = require('./tasks/task');
    });

    it('find tasks from module', () => {

        let tasks = findTasks(model);

        expect(tasks.length).gt(0);
        // console.log(tasks);

        let seq = toSequence(gulp, tasks, bindingConfig({
            oper: Operation.build,
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        console.log(seq);

        expect(seq.length).eq(3);
        expect(seq[0]).eq('TestTaskB');


    })

    it('find task define from module', () => {

        let tdfs = findTaskDefine(model);

        expect(tdfs.length).eq(1);
        expect(tdfs[0]).not.null;
        expect(tdfs[0]['fags']).eq('define');


    })

});
