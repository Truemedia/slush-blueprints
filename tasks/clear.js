var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

/* Clean up generated files (useful for development) */
gulp.task('clear', ['clear-configurations', 'clear-controllers', 'clear-migrations', 'clear-models', 'clear-routes', 'clear-views'], function() {
    return;
});

// Clear configuration files (generated only)
gulp.task('clear-configurations', function() {
	return gulp.src(['./config/formatting.php'], { read: false }).pipe( gulpPlugins.rm() );
});

// Clear controllers
gulp.task('clear-controllers', function() {
	return gulp.src(['./app/Http/Controllers/*.php'], { read: false }).pipe( gulpPlugins.rm() );
});

// Clear migrations
gulp.task('clear-migrations', function() {
	return gulp.src(['./database/migrations/*.php'], { read: false }).pipe( gulpPlugins.rm() );
});

// Clear models
gulp.task('clear-models', function() {
	return gulp.src(['./app/*.php'], { read: false }).pipe( gulpPlugins.rm() );
});

// Clear routes
gulp.task('clear-routes', function() {
	return gulp.src(['./app/Http/routes.php'], { read: false }).pipe( gulpPlugins.rm() );
});

// Clear views
gulp.task('clear-views', function() {
	return gulp.src(['./resources/views/**/**/*.php', './resources/views/**/**/*'], { read: false }).pipe( gulpPlugins.rm() );
});
