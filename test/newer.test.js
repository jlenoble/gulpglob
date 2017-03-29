import path from 'path';
import GulpGlob from '../src/gulpglob';
import gulp from 'gulp';
import equalStreamContents from 'equal-stream-contents';
import {tmpDir} from 'cleanup-wrapper';
import replace from 'gulp-replace';

describe(`Testing newer method`, function () {
  const dir1 = 'tmp1';
  const dir2 = 'tmp2';

  it(`Older files are filtered out`, tmpDir([dir1, dir2], function () {
    const ggSrc0 = new GulpGlob('test/**/*.js');
    const ggSrc1 = ggSrc0.dest(dir1);

    return ggSrc1.isReady().then(() => ggSrc1.dest(dir2).isReady())
    .then(() => new Promise((resolve, reject) => {
      gulp.src(path.join(dir1, '**/helpers.js'))
        .pipe(replace('const', 'var'))
        .on('error', reject)
        .on('end', resolve)
        .pipe(gulp.dest(dir1));
    }))
    .then(() => {
      return equalStreamContents(ggSrc1.newer(dir2),
        gulp.src([path.join(dir1, '**/*.js'), '!' + path.join(dir1,
          '**/*.test.js')]));
    });
  }));
});
