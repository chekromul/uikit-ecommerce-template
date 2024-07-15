const gulp = require('gulp');
const less = require('gulp-less');
const sync = require('browser-sync').create();
const concat = require('gulp-concat');
const del = require('del');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const pug = require('gulp-pug');
const jsmin = require('gulp-jsmin');
const ghPages = require('gulp-gh-pages');
const include = require('gulp-include');

// HTML
function html() {
  return gulp.src('src/templates/pages/**/*.pug')
    .pipe(pug({ basedir: 'src/templates' }))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream());
}

// Styles
function styles() {
  return gulp.src(['src/styles/**/*.less', '!src/styles/**/_*.less'])
    .pipe(less({ relativeUrls: true }))
    .pipe(concat('style.css'))
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(gulp.dest('dest/styles'))
    .pipe(sync.stream({ once: true }));
}

// Scripts
function scripts() {
  return gulp.src('src/scripts/*.js')
    .pipe(include({
      extensions: 'js',
      hardFail: true,
      includePaths: [
        __dirname + '/node_modules',
        __dirname + '/src/js'
      ]
    }))
    .pipe(jsmin())
    .pipe(gulp.dest('dest/scripts'))
    .pipe(sync.stream({ once: true }));
}

// Images
function images() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dest/images'));
}

// Copy
function copy() {
  return gulp.src([
    'src/*',
    'src/fonts/*',
    '!src/images/*',
    '!src/styles/*',
    '!src/scripts/*'
  ], { base: 'src' })
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream({ once: true }));
}

// Server
function server() {
  sync.init({
    notify: false,
    server: { baseDir: 'dest' }
  });
}

// Clean
function clean() {
  return del('dest');
}

// Clear
function clear() {
  return cache.clearAll();
}

// Watch tasks
function watchFiles() {
  gulp.watch('src/templates/**/*.pug', html);
  gulp.watch('src/styles/**/*.less', styles);
  gulp.watch('src/scripts/*.js', scripts);
  gulp.watch(['src/*', 'src/fonts/*', '!src/images/*', '!src/styles/*', '!src/scripts/*'], copy);
}

// Build
const build = gulp.parallel(html, styles, scripts, copy);

// Default
const defaultTask = gulp.series(build, gulp.parallel(watchFiles, server));

// Deploy
function deploy() {
  return gulp.src('dest/**/*')
    .pipe(ghPages());
}

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.copy = copy;
exports.server = server;
exports.clean = clean;
exports.clear = clear;
exports.watch = watchFiles;
exports.build = build;
exports.deploy = deploy;
exports.default = defaultTask;
