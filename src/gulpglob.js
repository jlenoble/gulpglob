import isValidGlob from 'is-valid-glob';
import merge from 'merge-stream';
import SimpleGulpGlob from './simple-gulpglob';
import {PolytonFactory} from 'polyton';

export function preprocess (args) {
  // GulpGlob must receive an array of valid SimpleGulpGlob arguments
  // Here args should always be a wrapping array

  let _args = args.map(glob => {
    if (!isValidGlob(glob)) {
      // Maybe we have SimpleGulpGlob arguments (glob, options)
      if (isValidGlob(glob[0]) && typeof glob[1] === 'object') {
        return [
          glob[0],
          Object.assign({
            ready: () => Promise.resolve(),
          }, glob[1]),
        ];
      }

      // Maybe we have an array of SimpleGulpGlobs
      if (Array.isArray(glob) && glob.length === 1) {
        const [glb] = glob;
        if (glb && glb.elements && glb.elements.every(el => el instanceof
          SimpleGulpGlob)) {
          return glb.reduce((array, el) => {
            // Now merge when possible
            const [glob1, options1] = array;
            const glob2 = el.glob;
            const options2 = {ready: el.isReady};
            return [glob1.concat(glob2), options1.concat(options2)];
          }, [[], []]);
          // Outter [] is necessary for the array glob to be viewed as a
          // single argument and not a list of args.
        }
      }

      // Unhandled cases
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    // Our glob was a valid one
    if (Array.isArray(glob)) {
      return [glob]; // Necessary for the array glob to be viewed as a
      // single argument and not a list of args.
    }
    return glob;
  });

  _args = _args.reduce((array1, array2) => {
    // Now merge when possible
    const [glob1, options1] = array1;
    const [glob2, options2] = array2;

    const options = options2 ? options1.concat(options2) : options1;

    return [glob1.concat(glob2), options];
  }, [[], []]);

  const [globs, options] = _args;

  return [[
    globs.sort().reverse(), // Have '!patterns' at the end
    Object.assign({}, ...options, {
      ready: () => {
        return Promise.all(options.map(opts => opts.ready()));
      },
    }),
  ]];
}

function postprocess (instance, args) {
  args.forEach((arg, i) => {
    if (arg.length > 1) {
      instance.at(i)._resetReady(arg[1]);
      instance.at(i)._resetOptions(arg[1]);
    }
  });
  return instance;
}

const GulpGlob = PolytonFactory(SimpleGulpGlob, [ // eslint-disable-line new-cap
  'literal',
  'ignore',
], undefined, {
  preprocess, postprocess,
  properties: {
    glob: {
      get () {
        return this.map(el => el.glob).reduce(
          (array, glb) => array.concat(glb), []);
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
      return merge(...this.map(el => el.src(options)));
    },
    newer (dest, options) {
      return merge(...this.map(el => el.newer(dest, options)));
    },
    toPromise () {
      return Promise.all(this.map(el => el.toPromise()));
    },
    list () {
      return Promise.all(this.map(el => {
        return el.list();
      })).then(
        lists => lists.reduce((array, list) => array.concat(list)), []);
    },
    dest (dir) {
      return new GulpGlob(...this.map(gg => gg._destArgs(dir)));
    },
  },
});

GulpGlob.getDefaults = SimpleGulpGlob.getDefaults;
GulpGlob.setDefaults = SimpleGulpGlob.setDefaults;

export default GulpGlob;
export {SimpleGulpGlob};
