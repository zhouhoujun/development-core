import 'mocha';
import { expect } from 'chai';
import { Operation, bindingConfig } from '../src';

import * as path from 'path';
let root = __dirname;

describe('directives', () => {


    it('build directives', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root },
            option: { src: 'src', dist: 'lib' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'lib'));

    })

    it('test directives', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root, test: true },
            option: { src: 'src', testSrc: 'test/**/*.spec.ts', dist: 'lib', testDist: 'testbuild' }
        });
        expect(ctx.getSrc()).eq(path.join(root, 'test/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'testbuild'));

    })

    it('e2e directives', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root, e2e: true },
            option: { src: 'src', e2eSrc: 'e2e/**/*.spec.ts', dist: 'lib', e2eDist: 'e2ebuild' }
        });
        expect(ctx.getSrc()).eq(path.join(root, 'e2e/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'e2ebuild'));

    })

    it('release directives', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root, release: true },
            option: { src: 'src', dist: 'lib', releaseDist: 'res' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'res'));

    })

    it('deploy directives', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root, deploy: true },
            option: { src: 'src', dist: 'lib', deployDist: 'deploy' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getDist()).eq(path.join(root, 'deploy'));

    })


    it('release testsrc', () => {

        let ctx = bindingConfig({
            oper: Operation.build,
            env: { root: root, release: true },
            option: { src: 'src', testSrc: 'test/**/*.spec.ts', dist: 'lib', releaseDist: 'release' }
        });


        expect(ctx.getSrc()).eq(path.join(root, 'src'));
        expect(ctx.getSrc({ oper: Operation.test | Operation.default })).eq(path.join(root, 'test/**/*.spec.ts'));
        expect(ctx.getDist()).eq(path.join(root, 'release'));

    })
});
