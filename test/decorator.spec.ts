import 'mocha';
import { expect } from 'chai';
import * as gulp from 'gulp';
import { Operation, createContext, toSequence } from '../src';
import * as path from 'path';

describe('decorator:', () => {

    let model: any;

    beforeEach(() => {
        model = require('./tasks/task');
    });

    it('find tasks from module', async () => {

        // console.log(tasks);

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });

        let tasks = await ctx.findTasks(model);

        expect(tasks.length).gt(0);

        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')
        expect(seq[0]).eq('test-clean');
        expect(seq[1]).eq('TestTaskB');

    })

    it('findTasks from module with Operation', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build });

        expect(tasks.length).eq(5);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')

    })

    it('findTasks from module with Operation.test | Operation.watch, build cmd', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(7);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW')

    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, build cmd', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(7);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW')

    })

    it('findTasks from module with Operation.build | Operation.watch, build cmd auto watch task', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib', watch: true }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.watch });

        expect(tasks.length).eq(6);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(5);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')
    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, build watch test cmd auto watch task', async () => {

        let ctx = createContext({
            env: { watch: true, test: true },
            option: { src: 'src', dist: 'lib', watch: true }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(8);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch,TestTaskC,TestTaskW,test-clean-TestTaskC-seq-owatch')
    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, build watch test cmd auto watch task with option name', async () => {

        let ctx = createContext({
            env: { watch: true, test: true },
            option: { src: 'src', dist: 'lib', watch: true, name: 'my' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(8);
        expect(seq.join(',')).eq('my-test-clean,my-TestTaskB,my-TestTaskE,my-test-tscompile,my-test-watch,my-TestTaskC,my-TestTaskW,my-test-clean-my-TestTaskC-seq-owatch')
    })

    it('findTasks from module with Operation.build | Operation.test | Operation.watch, release cmd', async () => {

        let ctx = createContext({
            env: { release: true },
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.test | Operation.watch });

        expect(tasks.length).eq(8);

        expect(ctx.oper).eq(Operation.release);

        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(5);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')

    })


    it('findTasks from module with Operation and env', async () => {

        let ctx = createContext({
            env: { watch: true },
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { oper: Operation.build | Operation.watch });

        // expect(tasks.length).eq(6);
        let seq = ctx.toSequence(tasks);

        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile,test-watch')

    })

    it('find task define from module', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tdfs = await ctx.findTaskDefine(model);

        // expect(tdfs.length).eq(1);
        expect(tdfs).not.null;
        expect(tdfs['fags']).eq('define');
    })


    it('findTasks from module with group', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { group: ['node', 'test'] });

        expect(tasks.length).eq(3);

    })

    it('find pipe tasks from module with group', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { group: 'pipetask' });

        expect(tasks.length).eq(1);

        let tk = tasks[0];
        tk.setup(createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        }), gulp);

        expect(tk.getInfo().taskName).eq('pipetask');

    })

    it('find pipe tasks from module with group config and task name', async () => {

        let ctx = createContext({
             env: {},
            option: { name: 'mytest', src: 'src', dist: 'lib' }
        });
        let tasks = await ctx.findTasks(model, { group: 'pipetask' });

        expect(tasks.length).eq(1);

        let tk = tasks[0];
        tk.setup(ctx, gulp);

        expect(tk.getInfo().taskName).eq('mytest-pipetask');

    });

    it('find tasks in dir', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });

        let tasks = await ctx.findTasksInDir(path.join(__dirname, './tasks'), { oper: Operation.build });

        expect(tasks.length).eq(5);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')
    });

    it('find tasks in compileted dir', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });

        let tasks = await ctx.findTasksInDir(path.join(__dirname, './tasks2'), { oper: Operation.build });

        expect(tasks.length).eq(5);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(4);
        expect(seq.join(',')).eq('test-clean,TestTaskB,TestTaskE,test-tscompile')
    });

    it('find tasks in dir task3', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });

        let tasks = await ctx.findTasksInDir(path.join(__dirname, './tasks3'), { oper: Operation.test });

        expect(tasks.length).eq(2);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(2);
        expect(seq.join(',')).eq('task3-clean,test')
    });


    it('find tasks in compileted dir task4', async () => {

        let ctx = createContext({
            env: {},
            option: { src: 'src', dist: 'lib' }
        });

        let tasks = await ctx.findTasksInDir(path.join(__dirname, './tasks4'), { oper: Operation.test });

        expect(tasks.length).eq(2);
        let seq = ctx.toSequence(tasks);

        // console.log(seq);
        expect(seq.length).eq(2);
        expect(seq.join(',')).eq('task3-clean,test')
    });


});
