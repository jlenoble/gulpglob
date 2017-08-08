import GulpGlob, {SimpleGulpGlob} from '../src/gulpglob';
import equalStreamContents from 'equal-stream-contents';
import gulp from 'gulp';
import path from 'path';
import {expect} from 'chai';
import {newTestDir} from './helpers';

describe(`Testing with various args`, function () {
  const cwd = process.cwd();

  const srcArgs = [
    ['src/**/*.js'],
    [['src/gulpglob.js', 'src/simple-gulpglob.js']],
    [['**/*.js'], {cwd: 'src'}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: 'src'}],
    [path.join(cwd, 'src/**/*.js')],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')]],
    [['**/*.js'], {cwd: path.join(cwd, 'src')}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: path.join(cwd, 'src')}],
    [[path.join(cwd, 'src/**/*.js')], {cwd: 'src'}],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')], {cwd: 'src'}],
    [[path.join(cwd, 'src/**/*.js')], {cwd: path.join(cwd, 'src')}],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')], {
      cwd: path.join(cwd, 'src'),
    }],
  ];

  const srcArgs2 = [
    ['src/*.js'],
    [['src/gulpglob.js', 'src/simple-gulpglob.js']],
    [['*.js'], {cwd: 'src'}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: 'src'}],
    [path.join(cwd, 'src/*.js')],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')]],
    [['*.js'], {cwd: path.join(cwd, 'src')}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: path.join(cwd, 'src')}],
    [[path.join(cwd, 'src/*.js')], {cwd: 'src'}],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')], {cwd: 'src'}],
    [[path.join(cwd, 'src/*.js')], {cwd: path.join(cwd, 'src')}],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')], {
      cwd: path.join(cwd, 'src'),
    }],
  ].reverse();

  describe(`Pattern 'src/**/*.js'`, function () {
    srcArgs.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });

    it('GulpGlob set with equivalent globs is properly reduced', function () {
      const gg1 = new GulpGlob(srcArgs[0]);
      const gg2 = new GulpGlob(...srcArgs); // All 12 globs yield the same and
      // GulpGlob knows it

      expect(gg1).to.equal(gg2);
      expect(gg2.glob).to.eql(['src/**/*.js']);
      expect(gg2.cwd).to.eql(cwd);
    });
  });

  describe(`Pattern 'src/*.js'`, function () {
    srcArgs2.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });

    it('GulpGlob set with equivalent globs is properly reduced', function () {
      const gg1 = new GulpGlob(srcArgs2[1]);
      const gg2 = new GulpGlob(...srcArgs2); // All 12 globs yield the same and
      // GulpGlob knows it

      expect(gg1).to.equal(gg2);
      expect(gg2.glob).to.eql(['*.js']);
      expect(gg2.cwd).to.eql(path.join(cwd, 'src'));
    });
  });

  describe(`Pattern '/tmp/dir/src/**/*.js'`, function () {
    srcArgs.forEach(args => {
      const ggSrc = new SimpleGulpGlob(...args);
      const dest = newTestDir('various');
      const ggDest = ggSrc.dest(dest);

      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(
        ggDest.paths)})`, function () {
        return ggDest.isReady().then(() => Promise.all([
          equalStreamContents(ggDest.src(), gulp.src(ggDest.paths)),
          equalStreamContents(ggDest.src(), gulp.src(path.join(dest,
            'src/**/*.js'))),
        ]));
      });

      const ggSrc2 = new GulpGlob(args);
      const ggDest2 = ggSrc2.dest(dest);

      it(`Comparing GulpGlob with gulp.src(${JSON.stringify(
        ggDest2.paths)})`, function () {
        return ggDest2.isReady().then(() => Promise.all([
          equalStreamContents(ggDest2.src(), gulp.src(ggDest2.paths)),
          equalStreamContents(ggDest2.src(), gulp.src(path.join(dest,
            'src/**/*.js'))),
        ]));
      });
    });
  });

  it(`With option {base: 'src'}`, function () {
    const ggSrc = new GulpGlob(['src/*.js', {base: 'src'}], [
      ['src/gulpglob.js', 'src/simple-gulpglob.js'], {base: 'src'}]);
    const dest = newTestDir('various');
    const ggDest = ggSrc.dest(dest);

    return ggDest.isReady().then(() => equalStreamContents(ggDest.src(),
      gulp.src(path.join(dest, '*.js'))));
  });
});
