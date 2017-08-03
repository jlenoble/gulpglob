import isValidGlob from 'is-valid-glob';
import gulp from 'gulp';
import SimpleGulpGlob from './simple-gulpglob';
import {PolytonFactory} from 'polyton';

const GulpGlob = PolytonFactory(SimpleGulpGlob, [
  'set:literal',
  {type: 'option', sub: {
    cwd: {
      type: 'literal',
      optional: true,
    },
    base: {
      type: 'literal',
      optional: true,
    },
  }, optional: true},
], undefined, {
  preprocess: function (args) {
    return args.map(([glb, options]) => {
      if (!isValidGlob(glb)) {
        if (!(glb instanceof SimpleGulpGlob)) {
          throw new TypeError(`Invalid glob element: "${
            JSON.stringify(glb)
          }"`);
        }

        return [glb.glob, glb.options];
      }

      return [Array.isArray(glb) ? glb : [glb], options];
    });
  },

  properties: {
    glob: {
      get () {
        return this.reduce((array, el) => array.concat(el.glob), []);
      },
    },
    length: {
      get () {
        return this.glob.length;
      },
    },
  },

  extend: {
    isReady () {
      return Promise.all(this.map(el => el.isReady()));
    },

    src (options) {
      return gulp.src(this.glob, options);
    },

    list () {
      return this.isReady().then(() => new Promise((resolve, reject) => {
        const list = [];
        this.src()
          .on('data', file => {
            list.push(file.path);
          })
          .on('end', () => {
            console.log(list.join('\n'));
            resolve(list);
          });
      }));
    },

    dest (dir) {
      return new GulpGlob(...this.map(el => el.dest(dir)));
    },
  },
});

export default GulpGlob;
export {SimpleGulpGlob};
