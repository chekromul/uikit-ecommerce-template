var gulp         = require('gulp'),
    less         = require('gulp-less'),
    sync         = require('browser-sync'),
    concat       = require('gulp-concat'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('autoprefixer'),
    postcss      = require('gulp-postcss'),
    csso         = require('gulp-csso'),
    pug          = require('gulp-pug'),
    jsmin        = require('gulp-jsmin'),
    ghPages      = require('gulp-gh-pages'),
    include      = require('gulp-include');

// HTML

gulp.task('html', function() {
  return gulp.src(['src/templates/pages/**/*.pug'])
    .pipe(pug({
      basedir: 'src/templates'
    }))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream());
});

// Styles

gulp.task('styles', function() {
  return gulp.src(['src/styles/**/*.less', '!src/styles/**/_*.less'])
    .pipe(less({ relativeUrls: true }))
    .pipe(concat('style.css'))
    .pipe(postcss([autoprefixer({ browsers: 'last 2 versions' })]))
    .pipe(csso())
    .pipe(gulp.dest('dest/styles'))
    .pipe(sync.stream({
      once: true
    }));
});

// Scripts

gulp.task('scripts', function() {
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
    .pipe(sync.stream({
      once: true
    }));
});

// Images

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dest/images'));
});

// Copy

gulp.task('copy', function() {
  return gulp.src([
    'src/*',
    'src/fonts/*',
    '!src/images/*',
    '!src/styles/*',
    '!src/scripts/*'
  ], {
    base: 'src'
  })
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream({
      once: true
    }));
});

// Server

gulp.task('server', function() {
  sync.init({
    notify: false,
    //ui: false,
    //tunnel: true,
    server: {
      baseDir: 'dest'
    }
  });
});

// Clean

gulp.task('clean', function() {
  return del.sync('dest');
});

// Clear

gulp.task('clear', function() {
  return cache.clearAll();
});

// Watch

gulp.task('watch:html', function() {
  return gulp.watch('src/templates/**/*.pug', gulp.series('html'));
});

gulp.task('watch:styles', function() {
  return gulp.watch('src/styles/**/*.less', gulp.series('styles'));
});

gulp.task('watch:scripts', function() {
  return gulp.watch('src/scripts/*.js', gulp.series('scripts'));
});

gulp.task('watch:copy', function() {
  return gulp.watch([
    'src/*',
    'src/fonts/*',
    '!src/images/*',
    '!src/styles/*',
    '!src/scripts/*'
  ], gulp.series('copy'));
});

gulp.task('watch', gulp.parallel(
  'watch:html',
  'watch:styles',
  'watch:scripts',
  'watch:copy'
));

// Build

gulp.task('build', gulp.parallel(
  'html',
  'styles',
  'scripts',
  'copy'
));

// Deploy

gulp.task('deploy', function () {
  return gulp.src('./dest/**/*')
    .pipe(ghPages())
});

// Default

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'server'
  )
));
