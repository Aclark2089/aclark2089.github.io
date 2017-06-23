var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var inject = require('gulp-inject');
var rs = require('run-sequence');

// Compile sass to css
gulp.task('sass', function () {
    return gulp.src('./css/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

// Watch for changes and recompile css
gulp.task('watch', function() {
    gulp.watch('css/sass/**/*.scss', ['sass:watch']);
});

// Take updated css file and min / inject it
gulp.task('sass:watch', function (cb) {
    rs('sass', 'minify-css', cb);
});

// Uglify JS
gulp.task('uglify', function (cb) {
    pump([
       gulp.src('js/**/*.js'),
       uglify(),
       gulp.dest('dist')
   ],
   cb
   );
});

// Uglify CSS
gulp.task('minify-css', function() {
    return gulp.src('css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist'));
});

// Inject dist
gulp.task('inject', function () {
   var target = gulp.src('./index.html');
   var sources = gulp.src(['dist/*.js', 'dist/*.css'], {read: false});

   return target.pipe(inject(sources))
       .pipe(gulp.dest(''));
});

// Compile sass, minify assets
gulp.task('compile', ['sass'], function (cb) {
    rs(['uglify', 'minify-css'], cb);
});

// Compile & inject into index.html
gulp.task('prod', ['compile'], function (cb) {
    rs(['inject']);
});