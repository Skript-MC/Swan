const del = require('delete');
const {
  dest,
  parallel,
  series,
  src,
} = require('gulp');
const ts = require('gulp-typescript');

const tsconfig = require('./tsconfig.json');

function clean(cb) {
  del(['build/'], cb);
}

function transpileTs() {
  return src(['src/**/*.ts', 'config/**/*.ts'], { base: './' })
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(dest('build/'));
}

function moveFiles() {
  return src(['package.json', 'assets/**/*.png'], { base: './' })
    .pipe(dest('build/'));
}

exports.default = series(clean, parallel(transpileTs, moveFiles));
