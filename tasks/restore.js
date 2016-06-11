var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

/* Restore from backup files (various implementations) */
gulp.task('restore', [
		'restore-migrations',
	], function() {
    return;
});

// Restore migrations from backup folder (included with Laravel)
gulp.task('restore-migrations', function() {
	return gulp.src(['./database/backup/*.php']).pipe( gulp.dest('./database/migrations/') );
});
