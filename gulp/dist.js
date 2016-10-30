import gulp from 'gulp';
import jscs from 'gulp-jscs';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

import {srcGlob} from './globs';

export const dist = () => {
  return gulp.src(srcGlob)
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('.'));
};

gulp.task('dist', dist);
