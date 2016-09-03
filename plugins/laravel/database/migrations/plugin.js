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

var blueprint = require('./blueprint/build');

// Overview
const PLUGIN_NAME = 'slush-regenerator:generate-migration';

/**
  * Plugin level function
  */
function plugin(options)
{
    var stream = through2.obj( function(file, enc, cb) {
        // Deal with potential issues
        if (file.isNull()) {
            return cb(null, file);
        }
        else if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        // Grab schema to work with
        var jsonSchema = JSON.parse( file.contents.toString() ),
            settings = blueprint.settings(options);

        // Create read stream to handle templating
        var src = {
                createTable: fs.createReadStream( blueprint.templatePath('create_table.php') ),
            },
            pipe = function(templateFileContents)
            {
                // Templating function
                var tpl = _.template( templateFileContents.toString(defaults.encoding) ),
                    templateData = blueprint.templateData(jsonSchema, settings),
                    fileContents = tpl(templateData).toString();

                // Push generated file to stream
                var migrationFile = new File({ // blueprint.file
                    contents: new Buffer(fileContents, defaults.encoding),
                    path: blueprint.filename(new moment(), templateData.tableName, 'create')
                });
                stream.push(migrationFile);

                // Callback
                cb(null, file);
            };

        // Assign pipes
        src.createTable.on('data', pipe);
    });

    return stream;
}


module.exports = plugin;
