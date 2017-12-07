import path from 'path';
import GulpGlob from '../src/gulpglob';
import {expect} from 'chai';

describe(`Testing resolve method`, function () {
  it(`src/**/*.js`, function () {
    const gg = new GulpGlob('src/**/*.js');

    return gg.resolve().then(files => {
      expect(files).to.eql(['gulpglob.js', 'simple-gulpglob.js'].map(
        file => path.join(process.cwd(), 'src', file)));
    });
  });

  it(`['src/**/*.js', '.babelrc']`, function () {
    const gg = new GulpGlob('src/**/*.js', '.babelrc');

    return gg.resolve().then(files => {
      expect(files).to.eql(['.babelrc', 'src/gulpglob.js',
        'src/simple-gulpglob.js'].map(file => path.join(process.cwd(), file)));
    });
  });
});
