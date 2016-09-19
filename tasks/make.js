"use strict";
var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    inquirer = require('inquirer'),
    requireDir = require('require-dir'),
    path = require('path'),
    pointer = require('json-pointer');
    // TODO: Load this from plugin dynamically
    const PLUGIN_NAME = 'slush-regenerator:make:migration';
    var yargs = require('yargs')
        .command(gulpPlugins.util.colors.yellow(`${PLUGIN_NAME}`), 'Generate a migration using JSON Schema file or via commandline options')
        .example(`${PLUGIN_NAME} --table=users`, 'Generate a migration for table called users')
        // Laravel plugin options
        .nargs('command', null)
        .describe('command', 'Command slug for plugin')
        .nargs('context', null)
        .describe('context', 'Context')
        .nargs('resource', null)
        .describe('resource', 'Resource folder name')
        .nargs('table', null)
        .describe('table', 'Table name for migration to generate')
        .alias('table', 'create')
        // Core plugin options
        .nargs('dest', null)
        .describe('dest', 'File destination')
        .nargs('file', null)
        .describe('file', 'Template file')
        .nargs('stream', null)
        .describe('stream', 'Name of stream')
        // General
        .nargs('w', null)
        .describe('w', 'Run wizard')
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
        // Command-line mode only
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            options = yargs.argv;
        }

        // Run stream
        gulp.src(['./*.schema.json'])
            .pipe( plugin(options) )
            .pipe( gulp.dest(blueprint.build.dest) )
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
// // Laravel
// gulp.task('generate-command', function(done) { generate('/laravel/app/Console/Commands', done) });
// gulp.task('generate-config', function(done) { generate('/laravel/config', done) });
// gulp.task('generate-controller', function(done) { generate('/laravel/app/Http/Controllers', done) });
// gulp.task('generate-migration', function(done) { generate('/laravel/database/migrations', done) });
// gulp.task('generate-model', function(done) { generate('/laravel/app', done) });
// gulp.task('generate-view', function(done) { generate('/laravel/resources/views', done) });
// // Core
// gulp.task('generate-plugin', function(done) { generate('/core/plugin', done) });