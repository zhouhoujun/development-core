import 'mocha';
import { expect } from 'chai';
import * as gulp from 'gulp';
import { findTasks, Operation, bindingConfig, toSequence, findTaskDefines, taskSequenceWatch } from '../src';


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
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')

    })

    it('findTasks from module with Operation.test | Operation.watch, build cmd', () => {

        let tasks = findTasks(model, { oper: Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = toSequence(gulp, tasks, bindingConfig({
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(7);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW')

    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, build cmd', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = toSequence(gulp, tasks, bindingConfig({
            env: {},
            option: { src: 'src', dist: 'lib' }
        }));

        // console.log(seq);
        expect(seq.length).eq(7);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW')

    })

    it('findTasks from module with Operation.build | Operation.watch, build cmd auto watch task', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.watch });

        expect(tasks.length).eq(6);
        let seq = toSequence(gulp, tasks, bindingConfig({
            env: {},
            option: { src: 'src', dist: 'lib', watch: true }
        }));

        // console.log(seq);
        expect(seq.length).eq(5);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')
    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, build watch test cmd auto watch task', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = toSequence(gulp, tasks, bindingConfig({
            env: { watch: true, test: true },
            option: { src: 'src', dist: 'lib', watch: true }
        }));

        // console.log(seq);
        expect(seq.length).eq(8);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW,test-clean-TestTaskC-watch')
    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, release cmd', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let ctx = bindingConfig({
            env: { release: true },
            option: { src: 'src', dist: 'lib' }
        });

        expect(ctx.oper).eq(Operation.release);

        let seq = toSequence(gulp, tasks, ctx);

        // console.log(seq);
        expect(seq.length).eq(5);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')

    })


    it('findTasks from module with Operation and env', () => {

        let tasks = findTasks(model, { oper: Operation.build | Operation.watch });

        // expect(tasks.length).eq(6);
        let seq = toSequence(gulp, tasks, bindingConfig({
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
            env: {},
            option: { name: 'mytest', src: 'src', dist: 'lib' }
        }), gulp);

        expect(tk.getInfo().taskName).eq('mytest-pipetask');

    })

});
