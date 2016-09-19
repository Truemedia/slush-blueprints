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
            requestName = `${modelName}Request`;

        return {modelName, requestName};
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
      let modelName = (options['model'] != undefined && typeof options['model'] === 'string') ? options['model'] : null;

      return {modelName};
    },

    dest: './app/Http/Requests'
};

module.exports = build;
