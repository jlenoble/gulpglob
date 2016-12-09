import gulp from 'gulp';
import path from 'path';
import isValidGlob from 'is-valid-glob';
import SimpleGulpGlob from './simple-gulpglob';
import {PolytonFactory} from 'polyton';

const GulpGlob = PolytonFactory(SimpleGulpGlob, ['literal'], undefined, {
  extend: {
    toPromise() {
      return Promise.all(this.map(el => el.toPromise()));
    },
    dest(dir) {
    }
  }
});

export default GulpGlob;
