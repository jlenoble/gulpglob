import gulp from 'gulp';
import isValidGlob from 'is-valid-glob';
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

    const pcwd = process.cwd();
    const cwd = options && options.cwd || SimpleGulpGlob.getDefaults().cwd;
    const base = options && options.base || SimpleGulpGlob.getDefaults().base;
    const exclude = options && options.exclude;

    this[_ready] = options && typeof options.ready === 'function' &&
      options.ready() || Promise.resolve();

    // Create or recover polyton polypath from glb
    let polypath = new PolyPath(...(Array.isArray(glb) ? glb : [glb]));

    // If options alter cwd, create or recover altered polyton
    if (cwd !== pcwd) {
      polypath = polypath.rebase(cwd);
    }

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

  dest (dest) {
    const polypath = this[_polypath].rebase(this.base, dest);

    return new SimpleGulpGlob(polypath.relative(dest), {
      ready: () => {
        return new Promise((resolve, reject) => {
          this.src().pipe(gulp.dest(dest))
            .on('error', reject)
            .on('end', resolve);
        });
      },
      cwd: dest,
      base: this.base,
    });
  }

  concat (sgg) {
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
}

SimpleGulpGlob.getDefaults = () => {
  return Object.assign({}, defaultOptions);
};

SimpleGulpGlob.setDefaults = ({cwd, base}) => {
  defaultOptions.cwd = cwd || process.cwd();
  defaultOptions.base = base || process.cwd();
};

export default SimpleGulpGlob;
