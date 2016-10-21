"use strict";
var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    inquirer = require('inquirer'),
    requireDir = require('require-dir'),
    path = require('path'),
    pointer = require('json-pointer'),
    Rx = require('rx');
    // TODO: Load this from plugin dynamically
    const GENERATOR_NAME = 'slush-regenerator';
    const MAKER_PREFIX = 'make';
    const GM = `${GENERATOR_NAME}:${MAKER_PREFIX}`;

    // TODO: Implement PO/MO language string handler
    var _ = function (string) {
        return string;
    };

    var yargs = require('yargs')
        // Make commands
        .command(gulpPlugins.util.colors.yellow(`${GM}-command`), _("Create a Command file"))
        .example(`${GM}-command`, _("Create a Command file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-configuration`), _("Create a Configuration file"))
        .example(`${GM}-configuration`, _("Create a Configuration file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-controller`), _("Create a Controller file"))
        .example(`${GM}-controller`, _("Create a Controller file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-handler`), _("Create a Handler file"))
        .example(`${GM}-handler`, _("Create a Handler file"))
        .command(gulpPlugins.util.colors.yellow(`${GM}-migration`), _("Create a Migration file"))
        .example(`${GM}-migration --table=users`, _("Generate a migration for table called users"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-model`), _("Create a Model file"))
        .example(`${GM}-model`, _("Create a Model file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-policy`), _("Create a Policy file"))
        .example(`${GM}-policy`, _("Create a Policy file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-provider`), _("Create a Provider file"))
        .example(`${GM}-provider`, _("Create a Provider file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-routes`), _("Create a Routes file"))
        .example(`${GM}-routes`, _("Create a Routes file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-request`), _("Create a Request file"))
        .example(`${GM}-request`, _("Create a Request file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-script`), _("Create a Javascript file"))
        .example(`${GM}-script`, _("Create a Javascript file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-seed`), _("Create a Seed file"))
        .example(`${GM}-seed`, _("Create a Seed file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-sprite`), _("Create a Sprite file"))
        .example(`${GM}-sprite`, _("Create a Sprite file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-style`), _("Create a Stylesheet file"))
        .example(`${GM}-style`, _("Create a Stylesheet file"))
		.command(gulpPlugins.util.colors.yellow(`${GM}-view`), _("Create a View file"))
        .example(`${GM}-view`, _("Create a View file"))
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
        var questions = ((yargs.argv.w) ? questionaire.ask(yargs.argv) : questionaire.skip(yargs.argv))
        var prompts = new Rx.Subject();
        var build = function() {
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
        };

        for (var question of questions) {
            prompts.onNext(question);
        }

        prompts.onCompleted();
    });
});
