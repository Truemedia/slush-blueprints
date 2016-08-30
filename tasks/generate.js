var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    inquirer = require('inquirer');
    // TODO: Load this from plugin dynamically
    const PLUGIN_NAME = 'slush-regenerator:generate-migration';
    var yargs = require('yargs')
        .command(gulpPlugins.util.colors.yellow(`${PLUGIN_NAME}`), 'Generate a migration using JSON Schema file or via commandline options')
        .example(`${PLUGIN_NAME} --table=users`, 'Generate a migration for table called users')
        .nargs('table', null)
        .describe('table', 'Table name for migration to generate')
        .alias('table', 'create')
        .nargs('w', null)
        .describe('w', 'Run wizard for generating migration')
        .alias('w', 'wizard')
        .help('h')
        .alias('h', 'help');

var migration = require('./../plugins/laravel/database/migrations/plugin');
var questionaire = require('./../plugins/laravel/database/migrations/generate/questionaire');

// Help dialogue
if (yargs.argv.h) {
    yargs.showHelp();
}

/* Generate */
function generate(context, done) {
    // Ask questions?
    inquirer.prompt(
        (yargs.argv.w) ? questionaire.ask(yargs.argv) : questionaire.skip(yargs.argv)
    ).then( function(options)
    {
        // Command-line mode only
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            options = yargs.argv;
        }

        // Run stream
        gulp.src(['./*.schema.json'])
            .pipe( migration(options) )
            .pipe( gulp.dest('./') )
            .on('end', function()
            {
                done();
            });
    });
}

gulp.task('generate-migration', function(done) { generate('migration', done) }); // Generate migration/s
