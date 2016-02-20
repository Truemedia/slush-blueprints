var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp');

/* Clean up generated files (useful for development) */
gulp.task('clear', function()
{
    return gulp.src([
			'./app/Http/Controllers/?Controller.php', // Controllers
			'./database/migrations/*.php', // Migrations
			'./app/*.php', // Models
			'./app/Http/routes.php' // Routes
		], { read: false })
        .pipe( gulpPlugins.rm() )
});
