import path from 'path';
import Muter, {muted} from 'muter';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GulpGlob from '../src/simple-gulpglob';
import {invalidArgs, validArgs, validDest, fileList, equalLists,
  equalFileContents} from './helpers';
import {tmpDir} from 'cleanup-wrapper';

chai.use(chaiAsPromised);

describe('SimpleGulpGlob is a class encapsulting gulp.src', function() {

  const muter = Muter(console, 'log');

  it(`A SimpleGulpGlob instance can't be initialized from an invalid glob argument`,
    function() {
      invalidArgs().forEach(arg => {
        expect(() => new GulpGlob(arg))
          .to.throw(TypeError, /Invalid glob element:/);
      });
  });

  it('A SimpleGulpGlob instance has a non-writable member glob', function() {
    const args = validArgs();
    args.forEach(arg => {
      const glb = new GulpGlob(arg);
      expect(glb.glob).to.eql((Array.isArray(arg) ? arg : [arg]).map(
        a => path.relative(process.cwd(), a)
      ));
      expect(() => {
        glb.glob = 'package.json';
      }).to.throw(TypeError, /Cannot set property glob/);
    });
  });

  it('A SimpleGulpGlob instance can list files', muted(muter, function() {
    return Promise.all(validArgs().map(glb => {
      const glob = new GulpGlob(glb);
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
        })
      ]);
    }));
  }));

  it('A SimpleGulpGlob instance can copy files', function() {
    this.timeout(5000);
    let run = Promise.resolve();
    [
      '/tmp/gulpglob-test_' + new Date().getTime(),
      'tmp'
    ].forEach(dest => {
      validArgs().forEach((glb, i) => {
        const func = function (dest) {
          const dest_glb = validDest(dest);
          const glob = new GulpGlob(glb);
          const dst = glob.dest(dest);

          expect(dst).to.be.instanceof(GulpGlob);
          expect(dst.glob).to.eql(dest_glb[i]);
          return dst.isReady().then(() => equalFileContents(glb, dest));
        };
        run = run.then(tmpDir(dest + i, func.bind(undefined, dest + i)))
          .catch(err => {
            expect(err).to.match(
              /Cannot delete files\/folders outside the current working directory\. Can be overriden with the `force` option/);
          });
      });
    });
    return run;
  });

});
