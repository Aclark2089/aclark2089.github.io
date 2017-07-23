var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var inject = require('gulp-inject');
var rs = require('run-sequence');

// Compile sass to css
gulp.task('sass', function() {
    return gulp.src('./assets/css/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css'));
});

// Watch for changes and recompile css
gulp.task('watch', function() {
    gulp.watch('./assets/css/sass/**/*.scss', ['sass:watch']);
});

// Take updated css file and min / inject it
gulp.task('sass:watch', function(cb) {
    rs('sass', 'minify-css', cb);
});

// Uglify JS
gulp.task('uglify', function(cb) {
    pump([
            gulp.src('./assets/js/*.js'),
            uglify(),
            gulp.dest('./dist')
        ],
        cb
    );
});

// Uglify CSS
gulp.task('minify-css', function() {
    return gulp.src('./assets/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('./dist'));
});

// Inject minified dist
gulp.task('inject:prod', function() {
    var target = gulp.src('./index.html');
    var sources = gulp.src(['./dist/*.js', './dist/*.css'], { read: false });

    return target.pipe(inject(sources))
        .pipe(gulp.dest(''));
});

// Inject
gulp.task('inject:dev', function() {
    var target = gulp.src('./index.html');
    var sources = gulp.src(['./assets/js/*.js', './assets/css/*.css'], { read: false });

    return target.pipe(inject(sources))
        .pipe(gulp.dest(''));
});

// Compile sass, minify assets
gulp.task('compile', ['sass'], function(cb) {
    rs(['uglify', 'minify-css'], cb);
});

// Compile & inject into index.html for production
gulp.task('prod', ['compile'], function(cb) {
    rs(['inject:prod']);
});

// Inject into index.html for dev
gulp.task('dev', ['sass'], function(cb) {
    rs(['inject:dev']);
});