// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	gulpPlugins = require('auto-plug')('gulp');

// Pipes
var pre_css = require('./../pipes/pre_css'),
		post_css = require('./../pipes/post_css');

// Task
var styles = function()
{
	return gulp.src('./resources/assets/sass/app.scss')
		.pipe( pre_css.pipeline() )
		.pipe( post_css.pipeline() )
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
