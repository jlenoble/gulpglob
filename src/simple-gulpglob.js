import gulp from 'gulp';
import isValidGlob from 'is-valid-glob';
import path from 'path';
import PolyPath, {Path} from 'polypath';

let defaultOptions = {
  cwd: process.cwd(),
  base: process.cwd(),
};

export const getOptions = options => {
  let cwd = options && options.cwd || SimpleGulpGlob.getDefaults().cwd;
  if (!path.isAbsolute(cwd)) {
    cwd = path.join(process.cwd(), cwd);
  }

  let base = options && options.base || cwd;
  if (!path.isAbsolute(base)) {
    base = path.join(process.cwd(), base);
  }

  const exclude = options && !!options.exclude;

  const ready = options && typeof options.ready === 'function' &&
    options.ready || (() => Promise.resolve());

  return {cwd, base, ready, exclude};
};

const _ready = Symbol();
const _polypath = Symbol();

class SimpleGulpGlob {
  constructor (glb, options) {
    if (!isValidGlob(glb)) {
      throw new TypeError(`Invalid glob element: "${
        JSON.stringify(glb)
      }"`);
    }

    const {base, cwd, ready, exclude} = getOptions(options);

    this[_ready] = ready();

    // Create or recover polyton polypath from glb
    const _glb = Array.isArray(glb) ? glb : [glb];
    const polypath = new PolyPath(..._glb.map(g => {
      return path.isAbsolute(g) ? g : path.join(cwd, g);
    }));

    this[_polypath] = polypath;

    Object.defineProperties(this, {
      cwd: {
        value: cwd,
      },

      base: {
        value: base,
      },

      exclude: {
        value: exclude,
      },

      paths: {
        value: polypath.paths,
      },

      glob: {
        value: polypath.relative(cwd),
      },

      options: {
        get () {
          return {
            cwd: this.cwd,
            base: this.base,
            exclude: this.exclude,
            ready: () => this[_ready],
          };
        },
      },
    });
  }

  isReady () {
    return this[_ready];
  }

  toPromise () {
    return this.isReady().then(() => this);
  }

  relative (base) {
    return this[_polypath].relative(base);
  }

  resolve () {
    return this[_polypath].resolve();
  }

  src (options) {
    return gulp.src(this.glob, Object.assign({
      base: this.base,
      cwd: this.cwd,
    }, options));
  }

  dest (dest, {ready} = {}) {
    const base = path.relative(this.cwd, this.base);
    const polypath = this[_polypath].rebase(this.base, dest);

    return new SimpleGulpGlob.Singleton([polypath.relative(dest), {
      ready: ready || (() => {
        return new Promise((resolve, reject) => {
          this.src().pipe(gulp.dest(dest))
            .on('error', reject)
            .on('end', resolve);
        });
      }),
      cwd: dest,
      base: path.join(dest, base),
    }]);
  }

  concat (sgg) {
    if (this.cwd !== sgg.cwd) {
      throw new Error(
        'SimpleGulpGlobs can only be concatenated if sharing working dir');
    }

    if (this.base !== sgg.base) {
      throw new Error(
        'SimpleGulpGlobs can only be concatenated if sharing base');
    }

    const polypath = new PolyPath(...this.paths,
      ...sgg.paths);

    return new SimpleGulpGlob(polypath.relative(this.cwd), {
      cwd: this.cwd,
      base: this.base,
      ready: () => Promise.all([this[_ready], sgg[_ready]]),
    });
  }

  _resetReady (options) {
    const {ready} = options;
    if (typeof ready === 'function') {
      this[_ready] = this[_ready].then(ready);
    }
  }
}

SimpleGulpGlob.getDefaults = () => {
  return Object.assign({}, defaultOptions);
};

SimpleGulpGlob.setDefaults = ({cwd, base}) => {
  cwd && (defaultOptions.cwd = new Path(cwd).path);
  base && (defaultOptions.base = new Path(base).path);
};

export default SimpleGulpGlob;
