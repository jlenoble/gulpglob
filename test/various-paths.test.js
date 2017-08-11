import GulpGlob, {SimpleGulpGlob} from '../src/gulpglob';
import equalStreamContents from 'equal-stream-contents';
import gulp from 'gulp';
import path from 'path';
import {expect} from 'chai';
import {newTestDir, checkPath} from './helpers';

describe(`Testing with various args`, function () {
  const cwd = process.cwd();

  const srcArgs1 = [
    ['src/**/*.js'],
    [['src/gulpglob.js', 'src/simple-gulpglob.js']],
    [path.join(cwd, 'src/**/*.js')],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')]],
  ];

  const srcArgs2 = [
    [['**/*.js'], {cwd: 'src'}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: 'src'}],
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

  const srcArgs3 = [
    ['src/*.js'],
    [['src/gulpglob.js', 'src/simple-gulpglob.js']],
    [path.join(cwd, 'src/*.js')],
    [[path.join(cwd, 'src/gulpglob.js'),
      path.join(cwd, 'src/simple-gulpglob.js')]],
  ].reverse();

  const srcArgs4 = [
    [['*.js'], {cwd: 'src'}],
    [['gulpglob.js', 'simple-gulpglob.js'], {cwd: 'src'}],
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
    srcArgs1.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
      it(`Comparing GulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new GulpGlob(args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });
    srcArgs2.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
      it(`Comparing GulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new GulpGlob(args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });

    it('GulpGlob set with equivalent globs is properly reduced', function () {
      const gg1 = new GulpGlob(srcArgs1[0]);
      const gg2 = new GulpGlob(...srcArgs1); // All 4 globs yield the same and
      // GulpGlob knows it

      expect(gg1).to.equal(gg2);
      expect(gg2.glob).to.eql(['src/**/*.js']);
      expect(gg2.cwd).to.eql(cwd);

      const gg3 = new GulpGlob(srcArgs2[0]);
      const gg4 = new GulpGlob(...srcArgs2); // All 8 globs yield the same and
      // GulpGlob knows it

      expect(gg3).to.equal(gg4);
      expect(gg4.glob).to.eql(['**/*.js']);
      expect(gg4.cwd).to.eql(path.join(cwd, 'src'));
    });
  });

  describe(`Pattern 'src/*.js'`, function () {
    srcArgs3.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
      it(`Comparing GulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new GulpGlob(args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });
    srcArgs4.forEach(args => {
      it(`Comparing SimpleGulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new SimpleGulpGlob(...args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
      it(`Comparing GulpGlob with gulp.src(${JSON.stringify(args[0])
      }${args[1] ? `, ${JSON.stringify(args[1])}` : ''})`, function () {
        const ggSrc = new GulpGlob(args);

        return Promise.all([
          equalStreamContents(ggSrc.src(), gulp.src(...args)),
          equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js')),
        ]);
      });
    });

    it('GulpGlob set with equivalent globs is properly reduced', function () {
      const gg1 = new GulpGlob(srcArgs3[1]);
      const gg2 = new GulpGlob(...srcArgs3); // All 4 globs yield the same and
      // GulpGlob knows it

      expect(gg1).to.equal(gg2);
      expect(gg2.glob).to.eql(['src/*.js']);
      expect(gg2.cwd).to.eql(cwd);

      const gg3 = new GulpGlob(srcArgs4[1]);
      const gg4 = new GulpGlob(...srcArgs4); // All 8 globs yield the same and
      // GulpGlob knows it

      expect(gg3).to.equal(gg4);
      expect(gg4.glob).to.eql(['*.js']);
      expect(gg4.cwd).to.eql(path.join(cwd, 'src'));
    });
  });

  describe(`Pattern '/tmp/dir/src/**/*.js'`, function () {
    srcArgs1.forEach(args => {
      it(`Comparing SimpleGulpGlob ${
        JSON.stringify(args)} with gulp.src()`, function () {
        const ggSrc = new SimpleGulpGlob(...args);
        const dest1 = newTestDir('various');
        const ggDest = ggSrc.dest(dest1);

        return ggDest.isReady().then(() => Promise.all([
          equalStreamContents(ggDest.src(), gulp.src(ggDest.paths)),
          equalStreamContents(ggDest.src(), gulp.src(path.join(dest1,
            'src/**/*.js'))),
        ]));
      });

      it(`Comparing GulpGlob ${
        JSON.stringify(args)} with gulp.src()`, function () {
        const ggSrc2 = new GulpGlob(args);
        const dest2 = newTestDir('various');
        const ggDest2 = ggSrc2.dest(dest2);

        return ggDest2.isReady().then(() => Promise.all([
          equalStreamContents(ggDest2.src(), gulp.src(ggDest2.paths)),
          equalStreamContents(ggDest2.src(), gulp.src(path.join(dest2,
            'src/**/*.js'))),
        ]));
      });
    });

    srcArgs2.forEach(args => {
      it(`Comparing SimpleGulpGlob ${
        JSON.stringify(args)} with gulp.src()`, function () {
        const ggSrc = new SimpleGulpGlob(...args);
        const dest1 = newTestDir('various');
        const ggDest = ggSrc.dest(dest1);

        checkPath(ggSrc.cwd);
        checkPath(ggSrc.base);
        ggSrc.paths.forEach(checkPath);
        checkPath(ggDest.cwd);
        checkPath(ggDest.base);
        ggDest.paths.forEach(checkPath);
        return ggDest.isReady().then(() => Promise.all([
          equalStreamContents(ggDest.src(), gulp.src(ggDest.paths)),
          equalStreamContents(ggDest.src(), gulp.src(path.join(dest1,
            '**/*.js'))),
        ]));
      });

      it(`Comparing GulpGlob ${
        JSON.stringify(args)} with gulp.src()`, function () {
        const ggSrc2 = new GulpGlob(args);
        const dest2 = newTestDir('various');
        const ggDest2 = ggSrc2.dest(dest2);

        checkPath(ggSrc2.cwd);
        checkPath(ggSrc2.base);
        ggSrc2.paths.forEach(checkPath);
        checkPath(ggDest2.cwd);
        checkPath(ggDest2.base);
        ggDest2.paths.forEach(checkPath);
        return ggDest2.isReady().then(() => Promise.all([
          equalStreamContents(ggDest2.src(), gulp.src(ggDest2.paths)),
          equalStreamContents(ggDest2.src(), gulp.src(path.join(dest2,
            '**/*.js'))),
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
