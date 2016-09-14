// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	gulpPlugins = require('auto-plug')('gulp');

// Pipes
var css = require('./../pipes/css');

// Task
var styles = function()
{
	return gulp.src('./resources/assets/sass/app.scss')
		.pipe( css.pipeline() )
		.pipe( gulpPlugins.rename({
			basename: 'style.min'
		}) )
		.pipe( gulp.dest('./public') );
};

// Task aliases
gulp.task('css', styles);
gulp.task('stylesheet', styles);
gulp.task('style', styles);
gulp.task('styles', styles);

// Watch
gulp.task('watch-styles', function()
{
	gulp.watch(['./resources/assets/sass/*.scss'], [
		'styles'
	]);
});
