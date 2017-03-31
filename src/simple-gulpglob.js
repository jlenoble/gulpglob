import gulp from 'gulp';
import path from 'path';
import isValidGlob from 'is-valid-glob';
import destglob from 'destglob';
import newer from 'gulp-newer';

let defaultOptions = {};

const _ready = Symbol();
const _options = Symbol();

class SimpleGulpGlob {

  constructor (glb, options) {
    if (!isValidGlob(glb)) {
      throw new TypeError('Invalid glob element: "' + glb + '"');
    }

    const opts = Object.assign({ready: () => Promise.resolve()}, options);

    let glob = glb;
    if (!Array.isArray(glob)) {
      glob = [glob];
    }

    const cwd = process.cwd();
    const _base = opts.base && path.join(cwd, path.relative(cwd, opts.base)) ||
      cwd;
    const _glob = glob.map(glb => path.relative(_base, glb));

    this[_ready] = opts.ready();

    delete opts.base;
    delete opts.ready;

    this[_options] = Object.keys(opts).length > 0 ? opts :
      SimpleGulpGlob.getDefaults();

    Object.defineProperties(this, {
      glob: {
        get () {
          return _glob;
        },
      },
      base: {
        get () {
          return _base;
        },
      },
    });
  }

  isReady () {
    return this[_ready];
  }

  src (options) {
    const opts = Object.assign({base: this.base}, options || this[_options]);
    return gulp.src(this.glob, opts);
  }

  newer (dest, options) {
    return this.src(options).pipe(newer(dest));
  }

  toPromise () {
    return this.isReady().then(() => this);
  }

  list () {
    return this.isReady().then(() => new Promise((resolve, reject) => {
      let list = [];
      this.src()
        .on('data', file => {
          list.push(file.history[0]);
        })
        .on('end', () => {
          console.log(list.join('\n'));
          resolve(list);
        });
    }));
  }

  dest (dest) {
    return new SimpleGulpGlob(...this._destArgs(dest));
  }

  _destArgs (dest) {
    return [destglob(this.glob, dest), {
      ready: () => {
        return new Promise((resolve, reject) => {
          this.src().pipe(gulp.dest(dest))
            .on('error', reject)
            .on('end', resolve);
        });
      },
    }];
  }

  _resetReady (options) {
    const {ready} = options;
    if (ready) {
      this[_ready] = ready();
    }
  }

  _resetOptions (options) {
    const opts = {};

    Object.keys(options).filter(name => name !== 'ready' && name !== 'base')
      .forEach(name => {
        opts[name] = options[name];
      });

    this[_options] = Object.keys(opts).length > 0 ? opts :
      SimpleGulpGlob.getDefaults();
  }

}

SimpleGulpGlob.getDefaults = () => {
  return Object.assign({}, defaultOptions);
};

SimpleGulpGlob.setDefaults = options => {
  if (typeof options === 'object') {
    defaultOptions = options;
  }
};

export default SimpleGulpGlob;
