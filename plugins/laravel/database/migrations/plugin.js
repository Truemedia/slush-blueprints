"use strict";

// Dependencies
var through2 = require('through2'),
    source = require('vinyl-source-stream'),
    glob = require('glob'),
    path = require('path'),
    fs = require('fs'),
    moment = require('moment'),
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

var BaseBlueprint = require('./regen/blueprints/base');

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

        let dest = '/database/migrations/*';
        let packagePath = null;
        let migrationFile = new BaseBlueprint({
            pluginPath: __dirname,
            path: (packagePath != null) ? path.join('.', packagePath, dest) : path.join('.', dest),
            encoding: config.get('defaults.encoding')
        });

        // Grab schema to work with
        var jsonSchema = JSON.parse( file.contents.toString() );
            migrationFile.options = options;

        // Create duplex streams
        var duplexStreams = {
            /**
              * Create table stream
              */
            createTable: {
                read: fs.createReadStream( migrationFile.templatePath('create_table.php.tpl') ),
                data: function(templateFileContents)
                {
                    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
                    magic.detect(templateFileContents, function(err, mimeType) {
                        if (err) throw err;

                        let templateData = migrationFile.templateData(jsonSchema);
                        migrationFile.basename = migrationFile.baseName(new moment(), templateData.tableName, mime.extension(mimeType));
                        migrationFile.compile(templateFileContents, templateData);

                        // Push generated file to stream
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
