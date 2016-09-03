"use strict";

// Dependencies
var through2 = require('through2'),
    defaults = require('./defaults.json'),
    File = require('vinyl'),
    source = require('vinyl-source-stream'),
    fs = require('fs'),
    moment = require('moment'),
    _ = require('underscore'),
    mmm = require('mmmagic'),
    Magic = require('mmmagic').Magic,
    mime = require('mime'),
    gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    PluginError = gulpPlugins.util.PluginError;

mime.define( require('./config/mime.json') );

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

        // Create sub-streams
        var subStreams = {
            /**
              * Create table stream
              */
            createTable: {
                read: fs.createReadStream( blueprint.templatePath('create_table.php.tpl') ),
                write: function(templateFileContents)
                {
                    var magic = new Magic(mmm.MAGIC_MIME_TYPE);
                    magic.detect(templateFileContents, function(err, mimeType) {
                        if (err) throw err;

                        // Templating function
                        var tpl = _.template( templateFileContents.toString(defaults.encoding) ),
                            templateData = blueprint.templateData(jsonSchema, settings),
                            fileContents = tpl(templateData).toString(),
                            fileExtension = mime.extension(mimeType);

                        // Push generated file to stream
                        var migrationFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, defaults.encoding),
                            path: blueprint.filename(fileExtension, new moment(), templateData.tableName, 'create')
                        });
                        stream.push(migrationFile);

                        // Callback
                        cb(null, file);
                    });
                }
            }
        };

        // Loop and assign streams to pipes
        for (let streamName in subStreams) {
            let subStream = subStreams[streamName],
                readStream = subStream.read,
                writeStream = subStream.write;

            readStream.on('data', writeStream);
        };
    });

    return stream;
}


module.exports = plugin;
