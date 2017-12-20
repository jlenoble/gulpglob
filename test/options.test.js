import GulpGlob from '../src/gulpglob';
import gulp from 'gulp';
import equalStreamContents from 'equal-stream-contents';

describe(`Testing options`, function () {
  const options = {
    cwd: 'build',
  };
  const options2 = {
    cwd: process.cwd(),
  };

  it(`Calling method src() with options`, function () {
    const ggSrc = new GulpGlob(['src/**/*.js']);
    return equalStreamContents(ggSrc.src(options), gulp.src('src/**/*.js',
      options));
  });

  it(`Calling ctor with options`, function () {
    const ggSrc = new GulpGlob(['src/**/*.js', options]);
    return equalStreamContents(ggSrc.src(), gulp.src('src/**/*.js',
      options));
  });

  it(`src() options have priority over ctor options`, function () {
    const ggSrc = new GulpGlob(['src/**/*.js', options]);

    return equalStreamContents(ggSrc.src(options2), gulp.src('src/**/*.js',
      options)).then(() => {
      throw new Error('options2 should have had priority over options');
    }, () => equalStreamContents(ggSrc.src(options2),
      gulp.src('src/**/*.js', options2)));
  });
});
