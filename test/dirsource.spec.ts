import 'mocha';
import { expect } from 'chai';
import { Operation, createContext } from '../src';
import * as _ from 'lodash';
import * as path from 'path';
let root = __dirname;

describe('directives', () => {


    it('build directives', () => {

        let ctx = createContext({
            env: { root: root },
            option: { src: 'src', dist: 'lib' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'lib'));

    })

    it('test directives', () => {

        let ctx = createContext({
            env: { root: root, test: true },
            option: { src: 'src', testSrc: 'test/**/*.spec.ts', dist: 'lib', testDist: 'testbuild' }
        });
        expect(ctx.getSrc()).eq(path.join(root, 'test/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'testbuild'));

    })


    it('e2e directives', () => {

        let ctx = createContext({
            env: { root: root, e2e: true },
            option: { src: 'src', e2eSrc: 'e2e/**/*.spec.ts', dist: 'lib', e2eDist: 'e2ebuild' }
        });
        expect(ctx.getSrc()).eq(path.join(root, 'e2e/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'e2ebuild'));

    })

    it('release directives', () => {

        let ctx = createContext({
            env: { root: root, release: true },
            option: { src: 'src', dist: 'lib', releaseDist: 'res' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'res'));

    })

    it('deploy directives', () => {

        let ctx = createContext({
            env: { root: root, deploy: true },
            option: { src: 'src', dist: 'lib', deployDist: 'deploy' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'deploy'));

    })


    it('release testsrc', () => {

        let ctx = createContext({
            env: { root: root, release: true },
            option: { src: 'src', testSrc: 'test/**/*.spec.ts', dist: 'lib', releaseDist: 'release' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getSrc({ oper: Operation.test | Operation.default })).eq(path.join(root, 'test/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'release'));

    })


    it('release testsrc with !', () => {

        let ctx = createContext({
            env: { root: root, release: true },
            option: { src: ['src', '!src/jspm'], testSrc: '!test/**/*.spec.ts', dist: 'lib', releaseDist: 'release' }
        });


        expect(_.last(ctx.getSrc())).eq('!' + path.join(root, 'src/jspm'));
        expect(ctx.getSrc({ oper: Operation.test | Operation.default })).eq('!' + path.join(root, 'test/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'release'));

    })

    it('release testsrc with relative', () => {

        let ctx = createContext({
            env: { root: root, release: true },
            option: { src: ['src', '!src/jspm'], testSrc: '!test/**/*.spec.ts', dist: 'lib', releaseDist: 'release' }
        });


        expect(_.last(ctx.getSrc({oper: Operation.build}, true))).eq('!src/jspm');
        expect(ctx.getSrc({ oper: Operation.test | Operation.default }, true)).eq('!test/**/*.spec.ts');
        expect(ctx.getDist()).eq(path.join(root, 'release'));

    })
});
