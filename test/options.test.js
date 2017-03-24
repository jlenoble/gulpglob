import GulpGlob from '../src/gulpglob';
import gulp from 'gulp';
import equalStreamContents from 'equal-stream-contents';
import {tmpOptions} from './helpers';

describe(`Testing options`, function () {
  const options = {
    cwd: 'src',
  };

  it(`Calling method src() with options`, function () {
    const ggSrc = new GulpGlob('src/**/*.js');

    return equalStreamContents(ggSrc.src(options), gulp.src('src/**/*.js',
      options));
  });

  it(`Calling ctor with options`, function () {
    const ggSrc = new GulpGlob(['src/**/*.js', options]);

    return equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js', options));
  });

  it(`Setting global options`, tmpOptions(function () {
    GulpGlob.setDefaults(options);

    const ggSrc = new GulpGlob('src/**/*.js');

    return equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js', options));
  }));

  it(`src() options have priority over ctor options`, function () {
    const ggSrc = new GulpGlob(['src/**/*.js', options]);

    return equalStreamContents(ggSrc.src({
      base: 'src',
    }), gulp.src('src/**/*.js', options)).catch(() =>
      equalStreamContents(ggSrc.src({
        base: 'src',
      }), gulp.src('src/**/*.js', {
        base: 'src',
      })));
  });

  it(`src() options have priority over global options`, tmpOptions(function () {
    GulpGlob.setDefaults(options);

    const ggSrc = new GulpGlob('src/**/*.js');

    return Promise.all([
      equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js', options)),
      equalStreamContents(ggSrc.src({
        base: 'src',
      }), gulp.src('src/**/*.js', options)).catch(() =>
        equalStreamContents(ggSrc.src({
          base: 'src',
        }), gulp.src('src/**/*.js', {
          base: 'src',
        }))),
    ]);
  }));

  it(`ctor options have priority over global options`, tmpOptions(function () {
    GulpGlob.setDefaults(options);

    const ggSrc = new GulpGlob(['src/**/*.js', {
      base: 'src',
    }]);

    return Promise.all([
      equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js', options))
      .catch(() =>
        equalStreamContents(ggSrc.src({
          base: 'src',
        }), gulp.src('src/**/*.js', {
          base: 'src',
        }))),
    ]);
  }));
});
