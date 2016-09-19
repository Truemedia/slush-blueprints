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
      var properties = jsonSchema.items.properties;

      let modelName = (settings.modelName != undefined) ? settings.modelName : predict.modelName(jsonSchema),
          tableName = (settings.tableName != undefined) ? settings.tableName : predict.tableName(jsonSchema),
          parentModelName = (settings.parentModelName != undefined) ? settings.parentModelName : predict.parentModelName(jsonSchema),
          parentTableName = (settings.parentTableName != undefined) ? settings.parentTableName : predict.parentTableName(jsonSchema),
          attributes = [],
          things = [];

      // Iterate properties in schema
      Object.keys(properties).forEach( function(propertyName, propertyIndex) {
        var propertyTypes = properties[propertyName].type,
            propertyFormat = (properties[propertyName].format != undefined) ? properties[propertyName].format : null;

        if (!(propertyTypes instanceof Array)) {
          propertyTypes = [propertyTypes];
        }

        var attribute = predict.attribute(jsonSchema, propertyIndex, propertyName, propertyTypes, propertyFormat, properties);
        attributes.push(attribute);
      });

      return {modelName, tableName, parentModelName, parentTableName, attributes, things};
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
          tableName = (options['table'] != undefined && typeof options['table'] === 'string') ? options['table'] : null,
          parentModelName = (options['parent-model'] != undefined && typeof options['parent-model'] === 'string') ? options['parent-model'] : null,
          parentTableName = (options['parent-table'] != undefined && typeof options['parent-table'] === 'string') ? options['parent-table'] : null;
      return {modelName, tableName, parentModelName, parentTableName};
    },

    dest: './app'
};

module.exports = build;
