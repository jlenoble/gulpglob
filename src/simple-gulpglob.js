import gulp from 'gulp';
import newer from 'gulp-newer';
import isValidGlob from 'is-valid-glob';
import path from 'path';
import PolyPath from 'polypath';

let defaultOptions = {
  cwd: process.cwd(),
  base: process.cwd(),
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

    let cwd = options && options.cwd || SimpleGulpGlob.getDefaults().cwd;
    if (!path.isAbsolute(cwd)) {
      cwd = path.join(process.cwd(), cwd);
    }

    let base = options && options.base || cwd;
    if (!path.isAbsolute(base)) {
      base = path.join(cwd, base);
    }

    const exclude = options && options.exclude;

    this[_ready] = options && typeof options.ready === 'function' &&
      options.ready() || Promise.resolve();

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

  src (options) {
    return gulp.src(this.glob, Object.assign({
      base: this.base,
      cwd: this.cwd,
    }, options));
  }

  newer (dest, options) {
    return this.src(options).pipe(newer(dest));
  }

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
  defaultOptions.cwd = cwd || process.cwd();
  defaultOptions.base = base || process.cwd();
};

export default SimpleGulpGlob;
