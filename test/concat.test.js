import SimpleGulpGlob from '../src/simple-gulpglob';
import {eq, newTestDir} from './helpers';
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
    const g2 = new SimpleGulpGlob('test/**/*.js');
    const g3 = new SimpleGulpGlob('src/**/*.js', {base: 'src'});
    const g4 = new SimpleGulpGlob('test/**/*.js', {base: 'src'});
    const g5 = new SimpleGulpGlob('src/**/*.js', {cwd: 'build'});
    const g6 = new SimpleGulpGlob('test/**/*.js', {cwd: 'build'});

    const g7 = new SimpleGulpGlob(['src/**/*.js', 'test/**/*.js']);
    const g8 = new SimpleGulpGlob(['src/**/*.js', 'test/**/*.js'],
      {base: 'src'});
    const g9 = new SimpleGulpGlob(['src/**/*.js', 'test/**/*.js'],
      {cwd: 'build'});

    expect(eq(g1.concat(g2), g7)).to.be.true;
    expect(eq(g2.concat(g1), g7)).to.be.true;
    expect(eq(g3.concat(g4), g8)).to.be.true;
    expect(eq(g4.concat(g3), g8)).to.be.true;
    expect(eq(g5.concat(g6), g9)).to.be.true;
    expect(eq(g6.concat(g5), g9)).to.be.true;

    const dir1 = newTestDir('concat');
    const dir2 = newTestDir('concat');

    const h1 = g1.dest(dir1);
    const h2 = g2.dest(dir1);
    const h7 = g7.dest(dir2);

    const dir3 = newTestDir('concat');
    const dir4 = newTestDir('concat');

    const h3 = g3.dest(dir3);
    const h4 = g4.dest(dir3);
    const h8 = g8.dest(dir4);

    const dir5 = newTestDir('concat');
    const dir6 = newTestDir('concat');

    const h5 = g5.dest(dir5);
    const h6 = g6.dest(dir5);
    const h9 = g9.dest(dir6);

    return Promise.all([
      equalStreamContents(merge(h1.src(), h2.src()), h7.src()),
      equalStreamContents(merge(h3.src(), h4.src()), h8.src()),
      equalStreamContents(merge(h5.src(), h6.src()), h9.src()),
    ]);
  });

  it(`Concatenating with SimpleGulpGlob not sharing cwd`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js', {cwd: 'build'});
    const g2 = new SimpleGulpGlob('test/**/*.js');

    const g3 = new SimpleGulpGlob(['src/**/*.js', '../test/**/*.js'],
      {cwd: g1.cwd});
    const g4 = new SimpleGulpGlob(['build/src/**/*.js', 'test/**/*.js'],
      {cwd: g2.cwd});

    expect(eq(g1.concat(g2), g3)).to.be.true;
    expect(eq(g2.concat(g1), g4)).to.be.true;
  });

  it(`Concatenating with SimpleGulpGlob not sharing base`, function () {
    const g1 = new SimpleGulpGlob('src/**/*.js', {base: 'src'});
    const g2 = new SimpleGulpGlob('test/**/*.js', {base: 'test'});

    expect(() => eq(g1.concat(g2))).to.throw(
      'SimpleGulpGlobs can only be concatenated if sharing base');
    expect(() => eq(g2.concat(g1))).to.throw(
      'SimpleGulpGlobs can only be concatenated if sharing base');
  });
});
