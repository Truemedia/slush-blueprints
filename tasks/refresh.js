var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

/* Refresh files (clear existing and restore backups) */
gulp.task('refresh', [
		'clear', 'restore'
	], function() {
    return;
});

// Refresh migrations
gulp.task('refresh-migrations', [
		'clear-migrations', 'restore-migrations'
	], function() {
    return;
});
