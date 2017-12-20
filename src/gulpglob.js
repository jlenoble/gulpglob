import isValidGlob from 'is-valid-glob';
import SimpleGulpGlob, {getOptions} from './simple-gulpglob';
import {SingletonFactory} from 'singletons';

const GulpGlob = SingletonFactory(SimpleGulpGlob, [
  'array:literal',
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
], {
  customArgs: [
    [String, {
      convert (glb) {
        return [[glb], getOptions()];
      },
    }],
    [Array, {
      convert ([glb, options]) {
        return [
          Array.isArray(glb) ? glb : [glb],
          getOptions(options),
        ];
      },
    }],
    [SimpleGulpGlob, {
      convert (glb) {
        return [glb.glob, glb.options];
      },
    }],
  ],

  preprocess: function (args) {
    // First do a sanity check on all args
    args.forEach(([glb, options]) => {
      if (!isValidGlob(glb)) {
        throw new TypeError(`Invalid glob element: "${
          JSON.stringify(glb)
        }"`);
      }
    });

    // Now split globs into excluded or not
    const args3 = [[]];
    let i;
    let exclude;

    args.forEach(([glb, options]) => {
      glb.forEach((g, nth) => {
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
          Object.assign({exclude}, options, {
            // Don't run more than once the same ready function on
            // sibling globs
            ready: nth === 0 ? options.ready : () => Promise.resolve(),
          })));
      });
    });

    // Merge all compatible paths into single globs
    const args4 = args3.map(sggs => {
      const sgg = sggs.reduce((sgg1, sgg2) => {
        return sgg1.concat(sgg2);
      });
      return sgg;
    });

    // Make sure bases and cwds are compatible
    let base;
    let cwd;
    args4.forEach(sgg => {
      if (!base) {
        base = sgg.base;
        cwd = sgg.cwd;
      } else if (base !== sgg.base) {
        throw new Error(
          'SimpleGulpGlobs can only be concatenated if sharing base');
      } else if (cwd !== sgg.cwd) {
        throw new Error(
          'SimpleGulpGlobs can only be concatenated if sharing cwd');
      }
    });

    return [args4.map(sgg => sgg.glob).reduce((g1, g2) => g1.concat(g2)),
      {base, cwd, ready: () => Promise.all(args4.map(sgg => sgg.isReady()))}];
  },

  postprocess (args) {
    const [, options] = args;
    this._resetReady(options);
  },
});

GulpGlob.getDefaults = SimpleGulpGlob.getDefaults;
GulpGlob.setDefaults = SimpleGulpGlob.setDefaults;

SimpleGulpGlob.Singleton = GulpGlob;

export default GulpGlob;
export {SimpleGulpGlob};
