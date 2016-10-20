"use strict";
var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    inquirer = require('inquirer'),
    requireDir = require('require-dir'),
    path = require('path'),
    pointer = require('json-pointer');
    // TODO: Load this from plugin dynamically
    const PLUGIN_NAME = 'slush-regenerator:make-migration';
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

// TODO: Turn function into plugin helper
var dest = function(jsonpath) {
    return path.join(jsonpath.replace('/laravel/', '/'), '*');
};

// Autoload make tasks
Object.keys(autoloadTasks).forEach( function(task)
{
    gulp.task(task, function(done)
    {
        // Load plugin
        let jsonpath = autoloadTasks[task],
            context = pointer.get(regeneratorPlugins, jsonpath);

        // Plugin libs
        let questionaire = context.regen.helpers.questionaire,
            plugin = context.plugin;


        // Ask questions?
        var prompts = ((yargs.argv.w) ? questionaire.ask(yargs.argv) : questionaire.skip(yargs.argv))
        inquirer.prompt(prompts)
        .then( function(options)
        {
            // Command-line mode only
            if (Object.keys(options).length === 0 && options.constructor === Object) {
                options = yargs.argv;
            }

            // Run stream
            return gulp.src(['./*.schema.json'])
                .pipe( plugin(options, dest(jsonpath)) )
                .pipe( gulp.dest('.') )
                .on('end', function()
                {
                    done();
                });
        });
    });
});
