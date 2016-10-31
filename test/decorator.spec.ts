import 'mocha';
import { expect } from 'chai';
import * as gulp from 'gulp';
import { findTasks, Operation, ITask, ITaskDefine, bindingConfig, toSequence, findTaskDefines } from '../src';


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

        expect(seq.length).eq(5);
        expect(seq[0]).eq('test-clean');
        expect(seq[1]).eq('TestTaskB');


    })

    it('findTasks from module with Operation', () => {

        let tasks = findTasks(model, { oper: Operation.build });

        expect(tasks.length).eq(6);

    })

    it('findTasks from module with Operation and env', () => {

        let tasks = findTasks(model, { oper: Operation.build, watch: true });

        expect(tasks.length).eq(8);

    })

    it('find task define from module', () => {

        let tdfs = findTaskDefines(model);

        expect(tdfs.length).eq(1);
        expect(tdfs[0]).not.null;
        expect(tdfs[0]['fags']).eq('define');


    })

});
