var gulp = require('gulp');
const minify = require('gulp-minify');
let cleanCSS = require('gulp-clean-css');
 
// Basic usage

gulp.task('default', function() {
  gulp.src(['src/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('js')),
  gulp.src('src/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('css'));
});
