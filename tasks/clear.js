var argv = require('yargs').argv,
	gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp'),
	gutil = require('gulp-util'),
	lazypipe = require('lazypipe');

// Badly named plugin
gulpPlugins.addsrc = require('gulp-add-src');

// Pipelines
var pipelines = {
	commands: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Console/Kernel.php', './app/Console/Commands/*Command.php']),
	configurations: lazypipe().pipe(gulpPlugins.addsrc.append, ['./config/formatting.php']),
	controllers: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/Controllers/Core/*Controller.php', './app/Http/Controllers/Resources/**/*Controller.php']),
	migrations: lazypipe().pipe(gulpPlugins.addsrc.append, ['./database/migrations/*.php']),
	models: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/*.php']),
	policies: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Policies/*.php']),
	requests: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/Requests/*.php', '!./app/Http/Requests/Request.php']),
	routes: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/routes.php']),
	seeds: lazypipe().pipe(gulpPlugins.addsrc.append, ['./database/seeds/*.php']),
	views: lazypipe().pipe(gulpPlugins.addsrc.append, ['./resources/views/layouts/**/*.php', './resources/views/pages/**/**/**/*.php'])
};

// Cleanse function
var cleanse = function(context) {
	if (whitelist.length == 0 || (whitelist.indexOf(context) > -1)) {
		gutil.log( gutil.colors.green(`Clearing ${context}`) );
		return gulp.src([]).pipe( pipelines[context]() ).pipe( gulpPlugins.rm() );
	}
	else {
		gutil.log( gutil.colors.yellow(`Not clearing ${context}, pass --${context} flag or run this task with no flags`) );
		return null;
	}
}

// Populate whitelist
var whitelist = [];
Object.keys(pipelines).forEach( function(pipeline) {
	if (argv[pipeline]) {
		whitelist.push(pipeline);
	}
});

/* Clean up generated files (useful for development) */
gulp.task('clear', [
		'clear-commands',
		'clear-configurations',
		'clear-controllers',
		'clear-migrations',
		'clear-models',
		'clear-policies',
		'clear-routes',
		'clear-requests',
		'clear-seeds',
		'clear-views'
	], function() {
    return;
});

// Clear commands
gulp.task('clear-commands', function() { return cleanse('commands') });

// Clear configuration files (generated only)
gulp.task('clear-configurations', function() { return cleanse('configurations') });

// Clear controllers
gulp.task('clear-controllers', function() { return cleanse('controllers') });

// Clear migrations
gulp.task('clear-migrations', function() { return cleanse('migrations') });

// Clear models
gulp.task('clear-models', function() { return cleanse('models') });

// Clear policies
gulp.task('clear-policies', function() { return cleanse('policies') });

// Clear requests
gulp.task('clear-requests', function() { return cleanse('requests') });

// Clear routes
gulp.task('clear-routes', function() { return cleanse('routes') });

// Clear seeds
gulp.task('clear-seeds', function() { return cleanse('seeds') });

// Clear views
gulp.task('clear-views', function() { return cleanse('views') });
