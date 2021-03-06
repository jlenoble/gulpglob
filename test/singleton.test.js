import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GulpGlob from '../src/gulpglob';
import {tmpDir} from 'cleanup-wrapper';

chai.use(chaiAsPromised);

describe('GulpGlob is singleton class', function () {
  it(`Instance returned by ctor is a singleton`, function () {
    const g1 = new GulpGlob(['src/**/*.js']);
    const g2 = new GulpGlob(['test/**/*.js']);
    const g3 = new GulpGlob(['src/**/*.js'], ['test/**/*.js']);

    const g4 = new GulpGlob(['src/**/*.js']);
    const g5 = new GulpGlob(['src/**/*.js'], ['test/**/*.js']);
    const g6 = new GulpGlob(['test/**/*.js'], ['src/**/*.js']);

    const g7 = new GulpGlob([['src/**/*.js']]);
    const g8 = new GulpGlob([['src/**/*.js', 'test/**/*.js']]);
    const g9 = new GulpGlob([['test/**/*.js', 'src/**/*.js']]);

    const g10 = new GulpGlob(g1);
    const g11 = new GulpGlob(g1, g2);
    const g12 = new GulpGlob(g2, g1);

    expect(g1).to.equal(g4);
    expect(g1).to.equal(g7);
    expect(g1).to.equal(g10);

    expect(g3).to.equal(g5);
    expect(g3).to.equal(g6);
    expect(g3).to.equal(g8);
    expect(g3).to.equal(g9);
    expect(g3).to.equal(g11);
    expect(g3).to.equal(g12);

    expect(g1).not.to.equal(g2);
    expect(g1).not.to.equal(g3);
  });

  it(`Instance returned by 'dest' method is a singleton`, tmpDir([
    'build1', 'build2',
  ], function () {
    const g = new GulpGlob(['src/**/*.js']);
    const g1 = g.dest('build1');
    const g2 = g.dest('build2');
    const g3 = g.dest('build1');

    expect(g1).not.to.equal(g2);
    expect(g1).to.equal(g3);

    return Promise.all([g1.isReady(), g2.isReady()]);
  }));
});
