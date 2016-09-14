// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	filelog = require('gulp-filelog'),
	browserify = require('browserify'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps');

// Browserify extras
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Pipes
var js = require('./../pipes/js');

// Task
var scripts = function()
{
	var file = './resources/assets/js/index.js';
	return browserify(file, {debug:true}).transform(babelify, {sourceMaps: true})
    .bundle()
    .pipe(source('script.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
		.pipe( gulp.dest('./public/') )
    .pipe(gutil.noop());
};

// Task aliases
gulp.task('js', scripts);
gulp.task('javascript', scripts);
gulp.task('script', scripts);
gulp.task('scripts', scripts);

// Watch
gulp.task('watch-scripts', function()
{
	gulp.watch(['./resources/assets/js/*.js'], [
		'scripts'
	]);
});
