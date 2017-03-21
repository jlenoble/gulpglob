import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GulpGlob from '../src/gulpglob';
import {tmpDir} from 'cleanup-wrapper';

chai.use(chaiAsPromised);

describe('GulpGlob is singleton class', function () {
  it(`Instance returned by ctor is a singleton`, function () {
    const g1 = new GulpGlob('src/**/*.js');
    const g2 = new GulpGlob('test/**/*.js');
    const g3 = new GulpGlob('src/**/*.js');
    const g4 = new GulpGlob('src/**/*.js', 'test/**/*.js');
    const g5 = new GulpGlob(g1);

    expect(g1).to.equal(g3);
    expect(g1).to.equal(g5);

    expect(g1).not.to.equal(g2);
    expect(g1).not.to.equal(g4);

    return g1.toPromise().then(gulpGlobs => {
      expect(gulpGlobs[0]).not.to.equal(g2.at(0));
      expect(gulpGlobs[0]).to.equal(g4.at(0));
      expect(gulpGlobs[0]).not.to.equal(g4.at(1));
    });
  });

  it(`Instance returned by 'dest' method is a singleton`, tmpDir('build1',
  tmpDir('build2', function () {
    const g = new GulpGlob('src/**/*.js');
    const g1 = g.dest('build1');
    const g2 = g.dest('build2');
    const g3 = g.dest('build1');

    expect(g1).not.to.equal(g2);
    expect(g1).to.equal(g3);
    expect(g1.at(0)).not.to.equal(g2.at(0));

    return Promise.all([g1.toPromise(), g2.toPromise()])
      .then(ggs => {
        const [_g1, _g2] = ggs;
        expect(_g1[0]).to.equal(g1.at(0));
        expect(_g2[0]).to.equal(g2.at(0));

        expect((new GulpGlob('build2/src/**/*.js').at(0).glob)).to.eql(
          ['build2/src/**/*.js']); // The underlying SimpleGulpGlob has the
          // correct path
        expect((new GulpGlob('build2/src/**/*.js')
          .at(0))).to.equal(g2.at(0)); // The underlying SimpleGulpGlob is
          // already cached as expected
      });
  })));
});
