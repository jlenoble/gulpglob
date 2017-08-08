import path from 'path';
import Muter, {muted} from 'muter';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GulpGlob from '../src/gulpglob';
import {invalidArgs, validArgs, fileList, fileSrc, equalLists,
  newTestDir} from './helpers';
import {tmpDir} from 'cleanup-wrapper';
import equalStreamContents from 'equal-stream-contents';
import {toArrayOfArrays} from 'argu';
import equalFileContents from 'equal-file-contents';

chai.use(chaiAsPromised);

describe('GulpGlob is a class encapsulting gulp.src', function () {
  const muter = Muter(console, 'log'); // eslint-disable-line new-cap

  it(`A GulpGlob instance can't be initialized from an invalid glob argument`,
    function () {
      invalidArgs().forEach(arg => {
        expect(() => new GulpGlob([arg]))
          .to.throw(TypeError, /Invalid glob element:/);
      });
    });

  it('A GulpGlob instance has a non-writable member glob', function () {
    const args = validArgs();
    args.forEach(arg => {
      const glb = new GulpGlob([arg]);
      expect(glb.glob).to.eql((Array.isArray(arg) ? arg : [arg]).map(
        a => path.relative(process.cwd(), a)
      ).sort());
      expect(() => {
        glb.glob = 'package.json';
      }).to.throw(TypeError, /Cannot assign to read only property 'glob'/);
    });
  });

  it('A GulpGlob instance can source files', function () {
    const p = Promise.all(validArgs().map(glb => {
      // Pass a valid glob as init arg
      const glob = new GulpGlob([glb]);
      const src = glob.src();
      const refSrc = fileSrc(glb);

      return equalStreamContents(src, refSrc);
    }));

    return p.then(() => Promise.all(validArgs().map(glb => {
      // Pass same valid glob as init arg, but spread in single subglobs
      const glbs = toArrayOfArrays(glb);
      const glob = new GulpGlob(...glbs);
      const src = glob.src();
      const refSrc = fileSrc(glb);

      return equalStreamContents(src, refSrc);
    })));
  });

  it('A GulpGlob instance can list files', muted(muter, function () {
    return Promise.all(validArgs().map(glb => {
      const glob = new GulpGlob([glb]);
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

  it('A GulpGlob instance can copy files', function () {
    this.timeout(5000); // eslint-disable-line no-invalid-this
    let run = Promise.resolve();
    [
      newTestDir('gulpglob'),
      'tmp',
    ].forEach(dest => {
      validArgs().forEach((glb, i) => {
        const func = function (dest) {
          const glob = new GulpGlob([glb]);
          const dst = glob.dest(dest);

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
