var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

gulp.task('clear', function()
{
    return gulp.src('./migrations/*.php', { read: false })
        .pipe( gulpPlugins.rm() )
});