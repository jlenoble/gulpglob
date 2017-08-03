import gulp from 'gulp';
import isValidGlob from 'is-valid-glob';
import PolyPath from 'polypath';

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
    const cwd = options && options.cwd || pcwd;
    const base = options && options.base || pcwd;

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

      glob: {
        value: polypath.relative(cwd),
      },
    });
  }

  isReady () {
    return this[_ready];
  }

  src (options) {
    return gulp.src(this.glob, Object.assign({
      base: this.base,
      cwd: this.cwd,
    }, options));
  }

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
  }

  dest (dest) {
    const polypath = this[_polypath].rebase(this.base, dest);
    return new SimpleGulpGlob(polypath.paths, {
      ready: () => {
        return new Promise((resolve, reject) => {
          this.src().pipe(gulp.dest(dest))
            .on('error', reject)
            .on('end', resolve);
        });
      },
      cwd: this.cwd,
      base: dest,
    });
  }
}

export default SimpleGulpGlob;
