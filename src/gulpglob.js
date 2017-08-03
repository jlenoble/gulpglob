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
], ['unordered', 'unique'], {
  preprocess: function (args) {
    // First have all args in the form [glb, options], converting
    // SimpleGulpGlobs and GulpGlobs
    const args2 = args.map(([glb, options]) => {
      if (!isValidGlob(glb)) {
        if (glb instanceof SimpleGulpGlob ||
          glb instanceof GulpGlob.BasePolyton) {
          return [glb.glob, glb.options];
        }

        throw new TypeError(`Invalid glob element: "${
          JSON.stringify(glb)
        }"`);
      }

      return [Array.isArray(glb) ? glb : [glb], options];
    });

    // Now individualize all glob strings and mark them as excluded or not
    const args3 = [[]];
    let i;
    let exclude;

    args2.forEach(([glb, options]) => {
      glb.forEach(g => {
        if (exclude === undefined) {
          exclude = g[0] === '!';
          i = 0;
        } else if (exclude !== (g[0] === '!')) {
          i++;
          args3.push([]);
          exclude = !exclude;
        }

        // Create an intermediate SimpleGulpGlob to handle easily cwd,
        // base and readiness
        args3[i].push(new SimpleGulpGlob(exclude ? g.substring(1) : g,
          Object.assign({exclude}, options)));
      });
    });

    return args2;
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
