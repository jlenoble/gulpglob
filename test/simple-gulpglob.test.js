import path from 'path';
import Muter, {muted} from 'muter';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SimpleGulpGlob from '../src/simple-gulpglob';
import {invalidArgs, validArgs, validDest, fileList,
  equalLists} from './helpers';
import {tmpDir} from 'cleanup-wrapper';
import equalFileContents from 'equal-file-contents';

chai.use(chaiAsPromised);

describe('SimpleGulpGlob is a class encapsulting gulp.src', function () {
  const muter = Muter(console, 'log'); // eslint-disable-line new-cap

  it(`A SimpleGulpGlob instance can't be initialized from an invalid glob` +
    `argument`, function () {
    invalidArgs().forEach(arg => {
      expect(() => new SimpleGulpGlob(arg))
        .to.throw(TypeError, /Invalid glob element:/);
    });
  });

  it('A SimpleGulpGlob instance has a non-writable member glob', function () {
    const args = validArgs();
    args.forEach(arg => {
      const glb = new SimpleGulpGlob(arg);
      expect(glb.glob).to.eql((Array.isArray(arg) ? arg : [arg]).map(
        a => path.relative(process.cwd(), a)
      ).sort());
      expect(() => {
        glb.glob = 'package.json';
      }).to.throw(TypeError, /Cannot assign to read only property 'glob'/);
    });
  });

  it('A SimpleGulpGlob instance can list files', muted(muter, function () {
    return Promise.all(validArgs().map(glb => {
      const glob = new SimpleGulpGlob(glb);
      const list = glob.list();
      const refList = fileList(glb);

      return Promise.all([
        equalLists(list, refList),
        list.then(() => {
          const logs = muter.getLogs().split('\n')
            .filter(el => el !== '').sort();
          muter.forget();
          return expect(refList.then(l => l.sort()))
            .to.eventually.eql(logs);
        }),
      ]);
    }));
  }));

  it('A SimpleGulpGlob instance can copy files', function () {
    this.timeout(5000); // eslint-disable-line no-invalid-this
    let run = Promise.resolve();
    [
      '/tmp/SimpleGulpGlob-test_' + new Date().getTime(),
      'tmp',
    ].forEach(dest => {
      validArgs().forEach((glb, i) => {
        const func = function (dest) {
          const destGlb = validDest(dest);
          const glob = new SimpleGulpGlob(glb);
          const dst = glob.dest(dest);

          expect(dst).to.be.instanceof(SimpleGulpGlob);
          expect(dst.glob).to.eql(destGlb[i].sort());

          let _glb = glb;
          if (Array.isArray(glb)) {
            _glb = [...glb];
            _glb.push('!' + dest);
          }
          return dst.isReady().then(() => equalFileContents(_glb, dest));
        };
        run = run.then(tmpDir(dest + i, func.bind(undefined, dest + i)))
          .catch(err => {
            try {
              expect(err).to.match(
                /Cannot delete files\/folders outside the current working directory\. Can be overriden with the `force` option/);
            } catch (e) {
              throw err;
            }
          });
      });
    });
    return run;
  });
});
