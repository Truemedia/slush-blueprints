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
        let commandSlug = settings.commandSlug,
            streamName = settings.streamName,
            streamFunctionName = changeCase.camelCase(settings.streamName),
            templateFilename = settings.templateFilename,
            dest = settings.dest;

        return {commandSlug, streamName, streamFunctionName, templateFilename, dest};
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
          streamName = (options['stream'] != undefined && typeof options['stream'] === 'string') ? options['stream'] : null,
          templateFilename = (options['file'] != undefined && typeof options['file'] === 'string') ? options['file'] : null,
          dest = (options['dest'] != undefined && typeof options['dest'] === 'string') ? options['dest'] : null;

      let settings = {commandSlug, streamName, templateFilename, dest};
      return settings;
    },

    dest: './'
};

module.exports = build;