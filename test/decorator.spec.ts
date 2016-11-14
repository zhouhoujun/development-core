import 'mocha';
import { expect } from 'chai';
import * as gulp from 'gulp';
import { findTasks, Operation, bindingConfig, toSequence, findTaskDefines } from '../src';


describe('decorator:', () => {

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

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')
        expect(seq[0]).eq('test-clean');
        expect(seq[1]).eq('TestTaskB');

    })

    it('findTasks from module with Operation', () => {

        let tasks = findTasks(model, { oper: Operation.build });

        expect(tasks.length).eq(5);
        let seq = toSequence(gulp, tasks, bindingConfig({
            oper: Operation.build,
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')

    })

    it('findTasks from module with Operation.test | Operation.watch', () => {

        let tasks = findTasks(model, { oper: Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = toSequence(gulp, tasks, bindingConfig({
            oper: Operation.build,
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(6);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC')

    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = toSequence(gulp, tasks, bindingConfig({
            oper: Operation.build,
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(6);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC')

    })


    it('findTasks from module with Operation and env', () => {

        let tasks = findTasks(model, { oper: Operation.build, watch: true });

        // expect(tasks.length).eq(6);
        let seq = toSequence(gulp, tasks, bindingConfig({
            oper: Operation.build,
            env: { watch: true },
            option: { src: 'src', dist: 'lib' }
        }));

        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')

    })

    it('find task define from module', () => {

        let tdfs = findTaskDefines(model);

        expect(tdfs.length).eq(1);
        expect(tdfs[0]).not.null;
        expect(tdfs[0]['fags']).eq('define');
    })


    it('findTasks from module with group', () => {

        let tasks = findTasks(model, { group: ['node', 'test'] });

        expect(tasks.length).eq(3);

    })

    it('find pipe tasks from module with group', () => {

        let tasks = findTasks(model, { group: 'pipetask' });

        expect(tasks.length).eq(1);

        let tk = tasks[0];
        tk.setup(bindingConfig({
            oper: Operation.build,
            env: {},
            option: { src: 'src', dist: 'lib' }
        }), gulp);

        expect(tk.getInfo().taskName).eq('pipetask');

    })

    it('find pipe tasks from module with group config and task name', () => {

        let tasks = findTasks(model, { group: 'pipetask' });

        expect(tasks.length).eq(1);

        let tk = tasks[0];
        tk.setup(bindingConfig({
            oper: Operation.build,
            env: {},
            option: { name: 'mytest', src: 'src', dist: 'lib' }
        }), gulp);

        expect(tk.getInfo().taskName).eq('mytest-pipetask');

    })

});
