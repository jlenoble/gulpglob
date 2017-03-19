import isValidGlob from 'is-valid-glob';
import merge from 'merge-stream';
import SimpleGulpGlob from './simple-gulpglob';
import {PolytonFactory} from 'polyton';

export function preprocess (args) {
  return args.map(glob => {
    if (!isValidGlob(glob)) {
      if (isValidGlob(glob[0])) { // Passing glob + options
        if (glob[1] && glob[1].ready) {
          return glob;
        }
      }
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }
    if (Array.isArray(glob)) {
      return [glob]; // Necessary for the array glob to be viewed as a
      // single argument and not a list of args.
    }
    return glob;
  });
}

function postprocess (instance, args) {
  args.forEach((arg, i) => {
    if (arg.length > 1) {
      instance.at(i)._resetReady(arg[1]);
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
        return [[], ...this.map(el => el.glob)].reduce(
          (array, glb) => array.concat(glb));
      },
    },
  },
  extend: {
    isReady () {
      return Promise.all(this.map(el => el.isReady()));
    },
    src () {
      return merge(...this.map(el => el.src()));
    },
    toPromise () {
      return Promise.all(this.map(el => el.toPromise()));
    },
    list () {
      return Promise.all(this.map(el => {
        return el.list();
      })).then(
        lists => [[], ...lists].reduce((array, list) => array.concat(list)));
    },
    dest (dir) {
      return new GulpGlob(...this.map(gg => gg._destArgs(dir)));
    },
  },
});

export default GulpGlob;
