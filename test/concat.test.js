import SimpleGulpGlob from '../src/simple-gulpglob';
import {eq, newTestDir, checkPath} from './helpers';
import {expect} from 'chai';
import merge from 'merge-stream';
import equalStreamContents from 'equal-stream-contents';

describe('SimpleGulpGlob has a method concat', function () {
  it(`Concatenating with self`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js');
    expect(eq(g1.concat(g1), g1)).to.be.true;
  });

  it(`Concatenating with SimpleGulpGlob sharing cwd and base`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js');
    checkPath(g1.cwd);
    checkPath(g1.base);
    g1.paths.forEach(checkPath);
    const g2 = new SimpleGulpGlob('test/**/*.js');
    checkPath(g2.cwd);
    checkPath(g2.base);
    g2.paths.forEach(checkPath);
    const g3 = new SimpleGulpGlob('build/src/**/*.js', {base: 'build'});
    checkPath(g3.cwd);
    checkPath(g3.base);
    g3.paths.forEach(checkPath);
    const g4 = new SimpleGulpGlob('build/test/**/*.js', {base: 'build'});
    checkPath(g4.cwd);
    checkPath(g4.base);
    g4.paths.forEach(checkPath);
    const g5 = new SimpleGulpGlob('src/**/*.js', {cwd: 'build'});
    checkPath(g5.cwd);
    checkPath(g5.base);
    g5.paths.forEach(checkPath);
    const g6 = new SimpleGulpGlob('test/**/*.js', {cwd: 'build'});
    checkPath(g6.cwd);
    checkPath(g6.base);
    g6.paths.forEach(checkPath);

    const g7 = new SimpleGulpGlob(['src/**/*.js', 'test/**/*.js']);
    checkPath(g7.cwd);
    checkPath(g7.base);
    g7.paths.forEach(checkPath);
    const g8 = new SimpleGulpGlob(['build/src/**/*.js', 'build/test/**/*.js'],
      {base: 'build'});
    checkPath(g8.cwd);
    checkPath(g8.base);
    g8.paths.forEach(checkPath);
    const g9 = new SimpleGulpGlob(['src/**/*.js', 'test/**/*.js'],
      {cwd: 'build'});
    checkPath(g9.cwd);
    checkPath(g9.base);
    g9.paths.forEach(checkPath);

    expect(eq(g1.concat(g2), g7)).to.be.true;
    expect(eq(g2.concat(g1), g7)).to.be.true;
    expect(eq(g3.concat(g4), g8)).to.be.true;
    expect(eq(g4.concat(g3), g8)).to.be.true;
    expect(eq(g5.concat(g6), g9)).to.be.true;
    expect(eq(g6.concat(g5), g9)).to.be.true;

    const dir1 = newTestDir('concat');
    const dir2 = newTestDir('concat');

    const h1 = g1.dest(dir1);
    checkPath(h1.cwd);
    checkPath(h1.base);
    h1.paths.forEach(checkPath);
    const h2 = g2.dest(dir1);
    checkPath(h2.cwd);
    checkPath(h2.base);
    h2.paths.forEach(checkPath);
    const h7 = g7.dest(dir2);
    checkPath(h7.cwd);
    checkPath(h7.base);
    h7.paths.forEach(checkPath);

    const dir3 = newTestDir('concat');
    const dir4 = newTestDir('concat');

    const h3 = g3.dest(dir3);
    checkPath(h3.cwd);
    checkPath(h3.base);
    h3.paths.forEach(checkPath);
    const h4 = g4.dest(dir3);
    checkPath(h4.cwd);
    checkPath(h4.base);
    h4.paths.forEach(checkPath);
    const h8 = g8.dest(dir4);
    checkPath(h8.cwd);
    checkPath(h8.base);
    h8.paths.forEach(checkPath);

    const dir5 = newTestDir('concat');
    const dir6 = newTestDir('concat');

    const h5 = g5.dest(dir5);
    checkPath(h5.cwd);
    checkPath(h5.base);
    h5.paths.forEach(checkPath);
    const h6 = g6.dest(dir5);
    checkPath(h6.cwd);
    checkPath(h6.base);
    h6.paths.forEach(checkPath);
    const h9 = g9.dest(dir6);
    checkPath(h9.cwd);
    checkPath(h9.base);
    h9.paths.forEach(checkPath);

    return Promise.all([
      equalStreamContents(merge(h1.src(), h2.src()), h7.src()),
      equalStreamContents(merge(h3.src(), h4.src()), h8.src()),
      equalStreamContents(merge(h5.src(), h6.src()), h9.src()),
    ]);
  });

  it(`Concatenating with SimpleGulpGlob not sharing cwd`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js', {cwd: 'build'});
    checkPath(g1.cwd);
    checkPath(g1.base);
    g1.paths.forEach(checkPath);
    const g2 = new SimpleGulpGlob('test/**/*.js');
    checkPath(g2.cwd);
    checkPath(g2.base);
    g2.paths.forEach(checkPath);

    expect(() => eq(g1.concat(g2))).to.throw(
      'SimpleGulpGlobs can only be concatenated if sharing working dir');
  });

  it(`Concatenating with SimpleGulpGlob not sharing base`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js', {base: 'src'});
    checkPath(g1.cwd);
    checkPath(g1.base);
    g1.paths.forEach(checkPath);
    const g2 = new SimpleGulpGlob('test/**/*.js', {base: 'test'});
    checkPath(g2.cwd);
    checkPath(g2.base);
    g2.paths.forEach(checkPath);

    expect(() => eq(g1.concat(g2))).to.throw(
      'SimpleGulpGlobs can only be concatenated if sharing base');
    expect(() => eq(g2.concat(g1))).to.throw(
      'SimpleGulpGlobs can only be concatenated if sharing base');
  });
});
