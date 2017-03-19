import glob from 'glob';
import path from 'path';
import gulp from 'gulp';
import {expect} from 'chai';

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

export function validDest (_dest) {
  const dest = path.relative(process.cwd(), _dest);
  return validArgs().map(glb => Array.isArray(glb) ?
    glb.map(g => path.join(dest, path.relative(process.cwd(), g))) :
    [path.join(dest, path.relative(process.cwd(), glb))]);
}

export function invalidArgs () {
  return [
    '',
    [],
    ['gulpfile.babel.js', ''],
    {},
    42,
  ];
};

export function fileList (glb) {
  let glbs = Array.isArray(glb) ? glb : [glb];

  return Promise.all(glbs.map(glb => new Promise((resolve, reject) => {
    glob(glb, (err, _files) => {
      if (err) {
        reject(err);
        return;
      }
      const files = _files.map(file => {
        return !path.isAbsolute(file) ? path.join(process.cwd(), file) : file;
      });
      resolve(files);
    });
  }))).then(files => files.reduce((arr1, arr2) => arr1.concat(arr2)));
};

export function fileSrc (glb) {
  return gulp.src(glb);
}

export function equalLists (list1, list2) {
  return list1.then(l => {
    return expect(list2).to.have.eventually.members(l);
  }).catch(err => {
    throw new Error(err);
  });
};
