import GulpGlob from '../src/gulpglob';
import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import equalFileContents from 'equal-file-contents';

describe(`Testing 'readiness' of GulpGlobs`, function () {

  const dest = 'tmp' + (new Date()).getTime();

  it(`Resetting 'ready' after calling dest()`, tmpDir(dest, function () {
    const ggSrc = new GulpGlob('src/**/*.js');
    const ggDest = new GulpGlob(`${dest}/src/**/*.js`);

    const gg = ggSrc.dest(dest); // ggDest singleton already defined with
    // a resolved promise option; must be overridden or equalFileContents
    // will fail because gg will be falsely ready.

    expect(gg).to.equal(ggDest);
    return gg.isReady().then(() => equalFileContents(`src/**/*.js`, dest));
    // If success, then postprocess works and 'ready' state was reset on
    // GulpGlob call within dest().
  }));

});
