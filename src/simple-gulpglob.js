import gulp from 'gulp';
import path from 'path';
import isValidGlob from 'is-valid-glob';
import destglob from 'destglob';

const _ready = Symbol();

class SimpleGulpGlob {

  constructor (glb, options = {ready: () => Promise.resolve()}) {
    if (!isValidGlob(glb)) {
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    let glob = glb;
    if (!Array.isArray(glob)) {
      glob = [glob];
    }

    const _base = process.cwd();
    const _glob = glob.map(glb => path.relative(_base, glb));

    this[_ready] = options.ready();

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

  src () {
    return gulp.src(this.glob, {base: this.base});
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

}

export default SimpleGulpGlob;
