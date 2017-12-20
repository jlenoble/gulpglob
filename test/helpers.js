import path from 'path';
import gulp from 'gulp';
import cleanupWrapper from 'cleanup-wrapper';
import SimpleGulpGlob from '../src/simple-gulpglob';
import {equiv} from 'keyfunc';
import os from 'os';

export function validArgs () {
  return [
    'src/gulpglob.js',
    '*.none',
    ['package.json'],
    ['gulpfile.babel.js', 'test/**/*.js'],
    ['gulp/**/*.js', 'test/**/*.js'],
    path.join(process.cwd(), 'package.json'),
    ['gulp/**/*.js', 'src/**/*.js', 'test/**/*.js', '*'],
  ];
};

export function invalidArgs () {
  return [
    undefined,
    '',
    [],
    ['gulpfile.babel.js', ''],
    {},
    42,
  ];
};

export function fileSrc (glb) {
  return gulp.src(glb);
}

export const tmpOptions = func => cleanupWrapper(func, {
  before () {
    this.defaultOptions = SimpleGulpGlob.getDefaults();
  },
  after () {
    SimpleGulpGlob.setDefaults(this.defaultOptions);
  },
});

export const eq = equiv({
  type: 'option',
  sub: {
    glob: 'array:literal',
    options: {
      type: 'option',
      sub: {
        cwd: {
          type: 'literal',
        },
        base: {
          type: 'literal',
        },
      },
    },
  },
});

let index = 0;
export const newTestDir = stem => {
  index++;
  return `/tmp/${stem ? stem + '-' : ''}test_${new Date().getTime()}_${index}`;
};

export const checkPath = dir => {
  // Make sure we don't write outside process.cwd() or /tmp/customDir
  const home = os.homedir();
  const tmp = '/tmp';

  const regexp1 = new RegExp(`(${home}|${tmp})/.*$`);

  if (!regexp1.test(dir)) {
    throw new Error(`${dir} is a bad directory path`);
  }

  const regexp2 = new RegExp(`${tmp}/(src|test|gulp)(/.*|)$`);

  if (regexp2.test(dir)) {
    throw new Error(`${dir} is a bad directory path`);
  }

  const regexp3 = new RegExp(`.*(src|test|gulp)/(src|test|gulp)(/.*|)$`);

  if (regexp3.test(dir)) {
    throw new Error(`${dir} is a bad directory path`);
  }

  const regexp4 = new RegExp(`.*build/build(/.*|)$`);

  if (regexp4.test(dir)) {
    throw new Error(`${dir} is a bad directory path`);
  }
};
