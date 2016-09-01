"use strict";
var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    inquirer = require('inquirer'),
    requireDir = require('require-dir'),
    path = require('path'),
    pointer = require('json-pointer');
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

var regeneratorPlugins = requireDir(path.join(__dirname, '..', 'plugins'), { recurse: true });

var autoload_tasks = {
    "generate-migration": "/laravel/database/migrations"
};

// Help dialogue
if (yargs.argv.h) {
    yargs.showHelp();
}

/* Generate */
function generate(jsonpath, done) {
    var blueprint = pointer.get(regeneratorPlugins, jsonpath);

    // Ask questions?
    var prompts = ((yargs.argv.w) ? blueprint.generate.questionaire.ask(yargs.argv) : blueprint.generate.questionaire.skip(yargs.argv))
    inquirer.prompt(prompts)
    .then( function(options)
    {
        if (options.columns) {
            blueprint.generate.questionaire.column();
        }

        // Command-line mode only
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            options = yargs.argv;
        }

        // Run stream
        gulp.src(['./*.schema.json'])
            .pipe( blueprint.plugin(options) )
            .pipe( gulp.dest('./') )
            .on('end', function()
            {
                done();
            });
    });
}

// Autoload
for (var task in autoload_tasks) {
    gulp.task(task, function(done) { generate(autoload_tasks[task], done) }); // Generate migration/s
}
