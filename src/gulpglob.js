import gulp from 'gulp';
import path from 'path';
import isValidGlob from 'is-valid-glob';

export default class GulpGlob {

  constructor(glob, ready = Promise.resolve()) {
    if (!isValidGlob(glob)) {
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    if (!Array.isArray(glob)) {glob = [glob];}

    const _base = process.cwd();
    const _glob = glob.map(glb => path.relative(_base, glb));

    var _ready = ready;
    this.isReady = () => _ready;

    Object.defineProperties(this, {
      glob: {
        get() {return _glob;}
      },
      base: {
        get() {return _base;}
      }
    });
  }

  src() {
    return gulp.src(this.glob, {base: this.base});
  }

  list() {
    return this.isReady().then(res => new Promise((resolve, reject) => {
      var list = [];
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

  dest(dest) {
    return new GulpGlob(this.glob.map(glb => {
      var a = glb.split('**');
      a[0] = path.join(dest, a[0]);

      if (a.length === 1) {
        return a[0];
      } else {
        return path.join(a[0], '**', a[1]);
      }
    }), new Promise((resolve, reject) => {
      this.src().pipe(gulp.dest(dest))
        .on('error', reject)
        .on('end', resolve);
    }));
  }

}
