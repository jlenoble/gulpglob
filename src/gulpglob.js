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

      return [Array.isArray(glb) ? glb : [glb], Object.assign(
        GulpGlob.getDefaults(), options)];
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

    // Merge all compatible paths into single globs
    const args4 = args3.map(sggs => {
      const sgg = sggs.reduce((sgg1, sgg2) => {
        return sgg1.concat(sgg2);
      });
      return sgg;
    });

    // Make sure bases are compatible
    let base;
    args4.forEach(sgg => {
      if (!base) {
        base = sgg.base;
      } else if (base !== sgg.base) {
        throw new Error(
          'SimpleGulpGlobs can only be concatenated if sharing base');
      }
    });

    return args4.map(sgg => [sgg.glob, sgg.options]);
  },

  properties: {
    cwd: {
      get () {
        return this.at(0).cwd;
      },
    },

    base: {
      get () {
        return this.at(0).base;
      },
    },

    glob: {
      get () {
        const cwd = this.cwd;

        return this.reduce((array, el) => {
          const glob = el.exclude ? el.relative(cwd).map(glb => '!' + glb) :
            el.relative(cwd);

          return array.concat(glob);
        }, []);
      },
    },

    length: {
      get () {
        return this.glob.length;
      },
    },

    options: {
      get () {
        return {
          cwd: this.cwd,
          base: this.base,
          // ready: () => this[_ready],
        };
      },
    },
  },

  extend: {
    isReady () {
      return Promise.all(this.map(el => el.isReady()));
    },

    toPromise () {
      return Promise.all(this.map(el => el.toPromise()));
    },

    src (options) {
      return gulp.src(this.glob, options || this.options);
    },

    list (options) {
      return this.isReady().then(() => new Promise((resolve, reject) => {
        const list = [];
        this.src(options)
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

GulpGlob.getDefaults = SimpleGulpGlob.getDefaults;
GulpGlob.setDefaults = SimpleGulpGlob.setDefaults;

export default GulpGlob;
export {SimpleGulpGlob};
