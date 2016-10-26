// import * as mocha from 'mocha';
// import { expect, assert } from 'chai';

// import { Operation, DirLoaderOption, Task, TaskConfig } from '../src/TaskConfig';
// let root = __dirname;
// import * as path from 'path';

// describe('LoaderFactory', () => {
//     var factory: ILoaderFactory;

//     beforeEach(() => {
//         factory = new LoaderFactory();
//     })

//     it('create dynamic loader', async function () {
//         let loader: ITaskLoader = factory.create({
//             src: 'src',
//             loader: []
//         });

//         let taskconfig: TaskConfig = await loader.loadConfg(Operation.build, { config: 'test' });

//         expect(taskconfig).to.not.null;
//         expect(taskconfig).to.not.undefined;
//         expect(taskconfig.env.config).to.equals('test');
//         expect(taskconfig.oper).to.eq(Operation.build);
//         expect(Array.isArray(taskconfig.option.loader)).to.false;
//         expect(Array.isArray(taskconfig.option.loader['dynamicTasks'])).to.true;
//     });

//     it('create directory loader', async function () {
//         let loader: ITaskLoader = factory.create({
//             src: 'src',
//             loader: <DirLoaderOption>{ dir: path.join(root, './tasks') }
//         });

//         let taskconfig: TaskConfig = await loader.loadConfg(Operation.deploy, { config: 'test' });

//         expect(taskconfig).to.not.null;
//         expect(taskconfig).to.not.undefined;
//         expect(taskconfig.env.config).to.equals('test');
//         expect(taskconfig.oper).to.eq(Operation.deploy);
//         expect(taskconfig.option.src).to.eq('src');

//         let tasks = await loader.load(taskconfig);
//         expect(tasks).not.null;
//     });


//     it('create module loader', async function () {
//         let loader: ITaskLoader = factory.create({
//             src: 'src',
//             loader: path.join(root, './tasks/config.ts')
//         });

//         let taskconfig: TaskConfig = await loader.loadConfg(Operation.release, { config: 'test' });
//         expect(taskconfig).to.not.null;
//         expect(taskconfig).to.not.undefined;
//         expect(taskconfig.env.config).to.equals('test');
//         expect(taskconfig.oper).to.eq(Operation.release);

//         let tasks = await loader.load(taskconfig);
//         expect(tasks).not.null;
//     });


//     it('create module object loader', async function () {
//         let loader: ITaskLoader = factory.create({
//             src: 'src',
//             loader: {
//                 module: {
//                     moduleTaskConfig(oper, option, env): TaskConfig {
//                         // register default asserts.
//                         return <TaskConfig>{
//                             oper: oper,
//                             env: env,
//                             option: option
//                         }
//                     },

//                     moduleTaskLoader(config: TaskConfig): Promise<Task[]> {
//                         return Promise.resolve([]);
//                     }
//                 }
//             }
//         });

//         let taskconfig: TaskConfig = await loader.loadConfg(Operation.release, { config: 'test' });

//         expect(taskconfig).to.not.null;
//         expect(taskconfig).to.not.undefined;
//         expect(taskconfig.env.config).to.equals('test');
//         expect(taskconfig.oper).to.eq(Operation.release);

//         let tasks = await loader.load(taskconfig);
//         expect(tasks).not.null;
//         expect(tasks.length).eq(0);

//     });

// });
