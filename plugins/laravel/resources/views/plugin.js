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
const PLUGIN_NAME = 'slush-regenerator:generate-view';

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
            * Create layout template stream
            */
          createLayoutTemplate: {
              read: fs.createReadStream( blueprint.templatePath('layouts/bootstrap/template.php.tpl') ),
              write: function(templateFileContents)
              {
                  var magic = new Magic(mmm.MAGIC_MIME_TYPE);
                  magic.detect(templateFileContents, function(err, mimeType) {
                      if (err) throw err;

                      // Templating function
                      var tpl = _.template( templateFileContents.toString( config.get('defaults.encoding') )),
                          templateData = {},
                          fileContents = tpl(templateData).toString(),
                          fileExtension = mime.extension(mimeType);

                      let resourceName = templateData.resourceName;

                      // Push generated file to stream
                      var layoutTemplateFile = new File({ // blueprint.file
                          contents: new Buffer(fileContents, config.get('defaults.encoding')),
                          path: blueprint.filename('layouts/bootstrap/template', 'php')
                      });
                      stream.push(layoutTemplateFile);

                      // Callback
                      // cb(null, file);
                  });
              }
          },

          /**
            * Create layout nav stream
            */
          createLayoutNav: {
              read: fs.createReadStream( blueprint.templatePath('layouts/bootstrap/_nav.php.tpl') ),
              write: function(templateFileContents)
              {
                  var magic = new Magic(mmm.MAGIC_MIME_TYPE);
                  magic.detect(templateFileContents, function(err, mimeType) {
                      if (err) throw err;

                      // Templating function
                      var tpl = _.template( templateFileContents.toString( config.get('defaults.encoding') )),
                          templateData = {},
                          fileContents = tpl(templateData).toString(),
                          fileExtension = mime.extension(mimeType);

                      let resourceName = templateData.resourceName;

                      // Push generated file to stream
                      var layoutNavFile = new File({ // blueprint.file
                          contents: new Buffer(fileContents, config.get('defaults.encoding')),
                          path: blueprint.filename('layouts/bootstrap/_nav', 'php')
                      });
                      stream.push(layoutNavFile);

                      // Callback
                      // cb(null, file);
                  });
              }
          },

            /**
              * Create form view stream
              */
            createFormView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/_form.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var formViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/_form`, 'php')
                        });
                        stream.push(formViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create list view stream
              */
            createListView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/_list.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var listViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/_list`, fileExtension)
                        });
                        stream.push(listViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create view view stream
              */
            createViewView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/_view.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var viewViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/_view`, fileExtension)
                        });
                        stream.push(viewViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create create view stream
              */
            createCreateView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/create.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var createViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/create`, 'php')
                        });
                        stream.push(createViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create destroy view stream
              */
            createDestroyView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/destroy.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var destroyViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/destroy`, 'php')
                        });
                        stream.push(destroyViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create edit view stream
              */
            createEditView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/edit.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var editViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/edit`, 'php')
                        });
                        stream.push(editViewFile);

                        // Callback
                        // cb(null, file);
                    });
                }
            },

            /**
              * Create index view stream
              */
            createIndexView: {
                read: fs.createReadStream( blueprint.templatePath('pages/resource/index.php.tpl') ),
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

                        let resourceName = templateData.resourceName;

                        // Push generated file to stream
                        var indexViewFile = new File({ // blueprint.file
                            contents: new Buffer(fileContents, config.get('defaults.encoding')),
                            path: blueprint.filename(`pages/${resourceName}/index`, 'php')
                        });
                        stream.push(indexViewFile);

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
