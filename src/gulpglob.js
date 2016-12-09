import gulp from 'gulp';
import path from 'path';
import isValidGlob from 'is-valid-glob';
import SimpleGulpGlob from './simple-gulpglob';
import {PolytonFactory} from 'polyton';

const GulpGlob = PolytonFactory(SimpleGulpGlob, ['literal'], undefined, {
  preprocess: function (args) {
    args = args.map(glob => {
      if (!isValidGlob(glob)) {
        throw new TypeError('Invalid glob element: "' + glob + '"');
      }
      if (Array.isArray(glob)) {
        return [glob]; // Necessary for the array glob to be viewed as a
        // single argument and not a list of args.
      }
      return glob;
    });
    return args;
  },
  extend: {
    toPromise() {
      return Promise.all(this.map(el => el.toPromise()));
    },
    list() {
      return Promise.all(this.map(el => {
        return el.list()
      })).then(
        lists => [[], ...lists].reduce((array, list) => array.concat(list)));
    },
    dest(dir) {
    }
  }
});

export default GulpGlob;
