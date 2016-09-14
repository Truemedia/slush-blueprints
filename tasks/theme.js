// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util');

// Pipes
var css = require('./../pipes/css');

/* Render website theme */
gulp.task('theme', function()
{
	gutil.log( gutil.colors.magenta('Rendering website theme') );
	return gulp.src('./resources/assets/sass/app.scss')
		.pipe( css.pipeline() )
		.pipe( gulp.dest('./public') );
});
