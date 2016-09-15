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
      let commandName = changeCase.camelCase(settings.commandSlug),
          signatureName = settings.commandSlug,
          description = settings.description;

      return {commandName, signatureName, description};
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
      let commandSlug = (options['command'] != undefined && typeof options['command'] === 'string') ? options['command'] : null,
          description = (options['description'] != undefined && typeof options['description'] === 'string') ? options['description'] : null;

      let settings = {commandSlug, description};
      return settings;
    },

    dest: './app/Console/Commands/'
};

module.exports = build;
