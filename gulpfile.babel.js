import del from 'delete';
import {
  dest,
  parallel,
  series,
  src,
} from 'gulp';
import babel from 'gulp-babel';
import gulpIf from 'gulp-if';

function isJavaScript(file) {
  return file.extname === '.js';
}

export function clean(cb) {
  del(['build/'], cb);
}

export function transpileJs() {
  return src(['src/**/*.js', 'src/**/.keep', 'config/**/*.js'], { base: './' })
    .pipe(gulpIf(isJavaScript, babel()))
    .pipe(dest('build/'));
}

export function moveFiles() {
  return src(['package.json', 'assets/**/*.png'], { base: './' })
    .pipe(dest('build/'));
}

export default series(clean, parallel(transpileJs, moveFiles));
