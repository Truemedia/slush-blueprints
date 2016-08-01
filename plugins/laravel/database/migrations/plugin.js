// Dependencies
var through2 = require('through2');
    gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp'),
    PluginError = gulpPlugins.util.PluginError;

var build = require('./generate/build');

const PLUGIN_NAME = 'slush-regenerator:generate-migration';

/**
  * Plugin level function
  */
function plugin()
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
        var jsonSchema = JSON.parse( file.contents.toString() );

        // Push generated file to stream
        this.push( ingest(jsonSchema) );
        cb(null, file);
    });

    return stream;
}

/**
  * Observe provided data, predict potential approach, advise changes, build files, incorporate into site
  */
function ingest(jsonSchema)
{
    return build.generate(jsonSchema);
}


module.exports = plugin;
