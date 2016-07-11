var argv = require('yargs').argv,
	gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp'),
	gutil = require('gulp-util'),
	lazypipe = require('lazypipe'),
	path = require('path');

// Badly named plugin
gulpPlugins.addsrc = require('gulp-add-src');

// Paths
var root = '.';
var paths = {
	handler: path.join(root, 'app', 'Exceptions'),
	view: path.join(root, 'resources', 'views')
};
// TODO: Clean up pipelines with paths

// Pipelines
var pipelines = {
	commands: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Console/Kernel.php', './app/Console/Commands/*Command.php']),
	configurations: lazypipe().pipe(gulpPlugins.addsrc.append, [
		'./config/*.php', '!./config/{app,auth,broadcasting,cache,compile,database,filesystems,mail,queue,services,session,view}.php'
	]), // Avoid deleting other configurations until functionality in place
	controllers: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/Controllers/Core/*Controller.php', './app/Http/Controllers/Resources/**/*Controller.php']),
	handlers: lazypipe().pipe(gulpPlugins.addsrc.append, [path.join(paths.handler, 'Handler.php')]),
	migrations: lazypipe().pipe(gulpPlugins.addsrc.append, ['./database/migrations/*.php']),
	models: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/*.php']),
	policies: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Policies/*.php']),
	providers: lazypipe().pipe(gulpPlugins.addsrc.append, [
		'./app/Providers/*.php', '!./app/Providers/{App,Event,Route}ServiceProvider.php'
	]), // Avoid deleting other providers until functionality in place
	requests: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/Requests/*.php', '!./app/Http/Requests/Request.php']),
	routes: lazypipe().pipe(gulpPlugins.addsrc.append, ['./app/Http/routes.php']),
	seeds: lazypipe().pipe(gulpPlugins.addsrc.append, ['./database/seeds/*.php']),
	views: lazypipe().pipe(gulpPlugins.addsrc.append, [
		path.join(paths.view, 'layouts', '**', '*.php'), path.join(paths.view, 'pages', '**', '**', '*.php'), path.join(paths.view, 'errors', '*.php')
	])
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
		'clear-handlers',
		'clear-migrations',
		'clear-models',
		'clear-policies',
		'clear-providers',
		'clear-routes',
		'clear-requests',
		'clear-seeds',
		'clear-views'
	], function() {
    return;
});

gulp.task('clear-commands', function() { return cleanse('commands') }); // Clear commands
gulp.task('clear-configurations', function() { return cleanse('configurations') }); // Clear configuration files
gulp.task('clear-controllers', function() { return cleanse('controllers') }); // Clear controllers
gulp.task('clear-handlers', function() { return cleanse('handlers') }); // Clear handlers
gulp.task('clear-migrations', function() { return cleanse('migrations') }); // Clear migrations
gulp.task('clear-models', function() { return cleanse('models') }); // Clear models
gulp.task('clear-policies', function() { return cleanse('policies') }); // Clear policies
gulp.task('clear-providers', function() { return cleanse('providers') }); // Clear policies
gulp.task('clear-requests', function() { return cleanse('requests') }); // Clear requests
gulp.task('clear-routes', function() { return cleanse('routes') }); // Clear routes
gulp.task('clear-seeds', function() { return cleanse('seeds') }); // Clear seeds
gulp.task('clear-views', function() { return cleanse('views') }); // Clear views
