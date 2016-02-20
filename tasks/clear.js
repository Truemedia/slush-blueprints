var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

/* Clean up generated files (useful for development) */
gulp.task('clear', function()
{
    return gulp.src([
			'./database/migrations/*.php', './app/*.php'
		], { read: false })
        .pipe( gulpPlugins.rm() )
});
