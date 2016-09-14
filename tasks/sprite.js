// Gulp core and plugins
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	spritesmith = require('gulp.spritesmith');

/* Compile map images into sprite and less file */
gulp.task('sprite', function(map)
{
	var spriteData = gulp.src('./resources/assets/sprite/*.png')
		.pipe( spritesmith({
			imgName: 'sprite.png',
			cssName: 'sprite.css'
		}));

	spriteData.img.pipe( gulp.dest('./public') );
	spriteData.css.pipe( gulp.dest('./public') );
});
