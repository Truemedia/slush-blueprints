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

// Automatically map plugins and tasks
var regeneratorPlugins = requireDir(path.join(__dirname, '..', 'plugins'), { recurse: true }),
    autoloadTasks = require('./../config/autoload.tasks.json');

// Help dialogue
if (yargs.argv.h) {
    yargs.showHelp();
}

/* Generate */
function generate(jsonpath, done) {
    var context = pointer.get(regeneratorPlugins, jsonpath),
        blueprint = context.blueprint,
        plugin = context.plugin;

    // Ask questions?
    var prompts = ((yargs.argv.w) ? blueprint.questionaire.ask(yargs.argv) : blueprint.questionaire.skip(yargs.argv))
    inquirer.prompt(prompts)
    .then( function(options)
    {
        if (options.columns) {
            blueprint.questionaire.column();
        }

        // Command-line mode only
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            options = yargs.argv;
        }

        // Run stream
        gulp.src(['./*.schema.json'])
            .pipe( plugin(options) )
            .pipe( gulp.dest('./') )
            .on('end', function()
            {
                done();
            });
    });
}

// Autoload tasks
for (var task in autoloadTasks) {
    gulp.task(task, function(done) { generate(autoloadTasks[task], done) });
}
