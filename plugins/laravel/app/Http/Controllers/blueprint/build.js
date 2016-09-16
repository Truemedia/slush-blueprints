"use strict";

// Dependencies
var changeCase = require('change-case'),
    File = require('vinyl'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path');

// Plugin libs
var predict = require('./predict');

var build = {

    /**
      * Generate filename from provided parameters
      *
      * @param {string} fileExtension - File extension
      */
    filename: function(baseName, fileExtension) {
        var filename = `${baseName}.${fileExtension}`;
        return filename;
    },

    /**
      * Extract template data from jsonSchema
      *
      * @param {json} jsonSchema - JSONschema instance
      * @param {json} settings - Preconfigured options
      */
    templateData: function(jsonSchema, settings) {
      let modelName = (settings.modelName != undefined) ? settings.modelName : predict.modelName(jsonSchema),
          controllerName = `${modelName}Controller`,
          requestName = `${modelName}Request`,
          layoutName = 'default',
          resourceName = (settings.resourceName != undefined) ? settings.resourceName : predict.resourceName(jsonSchema);

      return {resourceName, modelName, requestName, layoutName};
    },

    /**
      * Get template path
      *
      * @param {string} file - Filename
      */
    templatePath: function(filename) {
        return path.join(__dirname, '..', 'templates', filename);
    },

    /**
      * Build settings
      *
      */
    settings: function(options) {
      let modelName = (options['model'] != undefined && typeof options['model'] === 'string') ? options['model'] : null,
          resourceName = (options['resource'] != undefined && typeof options['resource'] === 'string') ? options['resource'] : null;

      return {modelName, resourceName};
    },

    dest:  './app/Http/Controllers'
};

module.exports = build;
