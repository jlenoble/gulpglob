import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GulpGlob from '../src/gulpglob';
import {tmpDir} from 'cleanup-wrapper';

chai.use(chaiAsPromised);

describe('GulpGlob is singleton class', function() {

  it(`Instance returned by ctor is a singleton`, function() {

    const g1 = new GulpGlob('src/**/*.js');
    const g2 = new GulpGlob('test/**/*.js');
    const g3 = new GulpGlob('src/**/*.js');

    return Promise.all([
      expect(g1.toPromise()).not.to.eventually.equal(g2),
      expect(g1.toPromise()).to.eventually.equal(g3)
    ]);

  });

  it(`Instance returned by 'dest' method is a singleton`, tmpDir('build1',
    tmpDir('build2', function() {

    const g = new GulpGlob('src/**/*.js');
    const g1 = g.dest('build1');
    const g2 = g.dest('build2');
    const g3 = g.dest('build1');

    return Promise.all([
      expect(g1.toPromise()).not.to.eventually.equal(g2),
      expect(g1.toPromise()).to.eventually.equal(g3)
    ]);

  })));

});
