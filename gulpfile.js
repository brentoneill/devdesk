var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    livereload = require('gulp-livereload')

//CSS Tasks
gulp.task('styles', function() {
  return sass('app/assets/scss/style.scss', {style: 'expanded'})
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(livereload());
});

//JS Tasks
// gulp.task('scripts', function() {
//   return gulp.src('app/**/*.js')
//     .pipe(jshint('.jshintrc'))
//     .pipe(jshint.reporter('default'))
//     .pipe(concat('main.js'))
//     .pipe(gulp.dest('dist/assets/js'))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(uglify())
//     .pipe(gulp.dest('dist/assets/js'))
//     .pipe(notify({ message: 'Scripts task complete' }));
// });

// //image compression
// gulp.task('images', function() {
//   return gulp.src('app/assets/images/**/*')
//     .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
//     .pipe(gulp.dest('dist/assets/img'))
//     .pipe(notify({ message: 'Images task complete' }));
// });

//Clean up
gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});


//The default Gulp task
gulp.task('default', ['clean'], function() {
    gulp.start('styles');
});

//Watch task
gulp.task('watch', function() {
  livereload.listen();
  // Watch .scss files
  gulp.watch('app/assets/**/*.scss', ['styles']);
  //
  // // Watch .js files
  // gulp.watch('src/scripts/**/*.js', ['scripts']);
  //
  // // Watch image files
  // gulp.watch('src/images/**/*', ['images']);

});
