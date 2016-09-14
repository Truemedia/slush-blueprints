// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	spritesmith = require('gulp.spritesmith'),
	buffer = require('vinyl-buffer');

// Pipes
var post_css = require('./../pipes/post_css'),
		img = require('./../pipes/img');

/* Compile map images into sprite and less file */
gulp.task('sprite', function(map)
{
	var spriteData = gulp.src('./resources/assets/sprite/*.png')
		.pipe( spritesmith({
			imgName: 'sprite.png',
			cssName: 'sprite.css'
		}));

	spriteData.img
		.pipe( buffer() )
		.pipe( img.pipeline() )
		.pipe( gulp.dest('./public') );
	spriteData.css
		.pipe( post_css.pipeline() )
		.pipe( gulp.dest('./public') );
});
