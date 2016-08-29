// Dependencies
var through2 = require('through2'),
    defaults = require('./defaults.json'),
    File = require('vinyl'),
    source = require('vinyl-source-stream'),
    fs = require('fs'),
    moment = require('moment'),
    _ = require('underscore'),
    gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    PluginError = gulpPlugins.util.PluginError;

var build = require('./generate/build');

// Overview
const PLUGIN_NAME = 'slush-regenerator:generate-migration';
var yargs = require('yargs')
    .command(gulpPlugins.util.colors.yellow(`${PLUGIN_NAME}`), 'Generate a migration using JSON Schema file or via commandline options')
    .example(`${PLUGIN_NAME} --table=users`, 'Generate a migration for table called users')
    .alias('table', 'create')
    .nargs('table', null)
    .describe('table', 'Table name for migration to generate')
    .help('h')
    .alias('h', 'help');

/**
  * Plugin level function
  */
function plugin()
{
    // Trigger overview
    if (yargs.argv.h) {
        yargs.showHelp();
    }

    var stream = through2.obj( function(file, enc, cb) {
        // Deal with potential issues
        if (file.isNull()) {
            return cb(null, file);
        }
        else if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        // Grab schema to work with
        var jsonSchema = JSON.parse( file.contents.toString() );

        // Commandline options
        var options = build.options(yargs.argv);

        // Create read stream to handle templating
        var templateFile = fs.createReadStream( build.templatePath('create_table.php') );
        templateFile.on('data', function(templateFileContents)
        {
            // Templating function
            var tpl = _.template( templateFileContents.toString(defaults.encoding) ),
                templateData = build.templateData(jsonSchema, options),
                fileContents = tpl(templateData).toString();

            // Push generated file to stream
            var migrationFile = new File({ // build.file
                contents: new Buffer(fileContents, defaults.encoding),
                path: build.filename(new moment(), templateData.tableName, 'create')
            });
            stream.push(migrationFile);

            // Callback
            cb(null, file);
        });

    });

    return stream;
}


module.exports = plugin;
