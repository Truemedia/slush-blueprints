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
const PLUGIN_NAME = 'slush-regenerator:generate-provider';

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
              * Create stream
              */
            create: {
                read: fs.createReadStream( blueprint.templatePath('Provider.php.tpl') ),
                write: function(templateFileContents)
                {
                    var magic = new Magic(mmm.MAGIC_MIME_TYPE);
                    magic.detect(templateFileContents, function(err, mimeType) {
                        if (err) throw err;

                        // Templating function
                        var tpl = _.template( templateFileContents.toString( config.get('defaults.encoding') )),
                            templateData = blueprint.templateData(jsonSchema, settings),
                            fileContents = tpl(templateData).toString(),
                            fileExtension = mime.extension(mimeType);

                        // Push generated file to stream
                        var newFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename('basename', fileExtension)
                        });
                        stream.push(newFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            }
        };

        // Loop and assign streams to pipes
        var mergedStream = require('merge-stream')();
        for (let streamName in subStreams) {
            let subStream = subStreams[streamName],
                readStream = subStream.read,
                writeStream = subStream.write;

            readStream.on('data', writeStream);
            mergedStream.add(readStream);
        };
        return mergedStream;
    });

    return stream;
}


module.exports = plugin;
