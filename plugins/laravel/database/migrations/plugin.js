"use strict";

// Dependencies
var through2 = require('through2'),
    File = require('vinyl'),
    source = require('vinyl-source-stream'),
    glob = require('glob'),
    path = require('path'),
    fs = require('fs'),
    moment = require('moment'),
    _ = require('underscore'),
    config = require('super-config'),
    mmm = require('mmmagic'),
    Magic = require('mmmagic').Magic,
    mime = require('mime'),
    gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    PluginError = gulpPlugins.util.PluginError;

// Setup procedure
config.loadConfig(glob.sync( path.join(__dirname, 'config/*.js') ));
mime.define( config.get('mime') );

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

        // Create duplex streams
        var duplexStreams = {
            /**
              * Create table stream
              */
            createTable: {
                read: fs.createReadStream( blueprint.templatePath('create_table.php.tpl') ),
                data: function(templateFileContents)
                {
                    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
                    magic.detect(templateFileContents, function(err, mimeType) {
                        if (err) throw err;

                        // Templating function
                        var tpl = _.template( templateFileContents.toString( config.get('defaults.encoding') )),
                            templateData = blueprint.templateData(jsonSchema, settings),
                            fileContents = tpl(templateData).toString();

                        // Push generated file to stream
                        var migrationFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(mime.extension(mimeType), new moment(), templateData.tableName, 'create')
                        });
                        stream.push(migrationFile);

                        // Callback
                        cb(null, migrationFile);
                    });
                }
            }
        };

        // Loop and assign streams to pipes
        for (let streamName in duplexStreams) {
            let duplexStream = duplexStreams[streamName],
                readStream = duplexStream.read,
                data = duplexStream.data;

            readStream.on('data', data);
        };
    });

    return stream;
}


module.exports = plugin;
