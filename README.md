# gulpglob
A wrapper around gulp.src to make recycling patterns easier

## Usage

```js
import GulpGlob from 'gulpglob';

const glob = new GulpGlob('test/**/*.js');
glob.src(); // Returns sourced glob 'test/**/*.js' as a stream
glob.list(); // Prints list of files from glob 'test/**/*.js'
const destGlob = glob.dest('build'); // Copy files into 'build' dir and returns associated GulpGlob object
destGlob.list(); // Prints list of files from glob 'build/test/**/*.js'
```

## License

gulpglob is [MIT licensed](./LICENSE).

© 2016-2017 [Jason Lenoble](mailto:jason.lenoble@gmail.com)
