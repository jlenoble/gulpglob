import glob from 'glob';
import path from 'path';
import del from 'del';
import gulp from 'gulp';
import diff from 'gulp-diff';
import {noop} from 'gulp-util';
import {expect} from 'chai';

export function validArgs() {
  return [
    'src/gulpglob.js',
    '*.none',
    ['package.json'],
    ['gulpfile.babel.js', 'test/**/*.js'],
    ['gulp/**/*.js', 'test/**/*.js'],
    path.join(process.cwd(), 'package.json')
  ];
};

export function validDest(dest) {
  dest = path.relative(process.cwd(), dest);
  return validArgs().map(glb => Array.isArray(glb) ?
    glb.map(g => path.join(dest, path.relative(process.cwd(), g))) :
    [path.join(dest, path.relative(process.cwd(), glb))]);
}

export function invalidArgs() {
  return [
    '',
    [],
    ['gulpfile.babel.js', ''],
    {},
    42
  ];
};

export function fileList(glb) {
  let glbs = Array.isArray(glb) ? glb : [glb];

  return Promise.all(glbs.map(glb => new Promise((resolve, reject) => {
    glob(glb, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      files = files.map(file => {
        if (!path.isAbsolute(file)) {
          file = path.join(process.cwd(), file);
        }
        return file;
      });
      resolve(files);
    });
  }))).then(files => files.reduce((arr1, arr2) => arr1.concat(arr2)));
};

export function equalLists(list1, list2) {
  return list1.then(l => {
    return expect(list2).to.have.eventually.members(l);
  }).catch((err) => {
    throw new Error(err);
  });
};

export function equalFileContents(glb, dest, pipe = noop) {
  return new Promise((resolve, reject) => {
    gulp.src(glb, {base: process.cwd()})
    .pipe(pipe())
    .pipe(diff(dest))
    .pipe(diff.reporter({fail: true}))
    .on('error', reject)
    .on('finish', resolve);
  });
};
