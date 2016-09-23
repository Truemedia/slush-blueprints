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

      var tableName = (settings.tableName != undefined) ? settings.tableName : predict.tableName(jsonSchema),
          columns = [];

      // Iterate properties in schema
      Object.keys(properties).forEach( function(property_name, property_index) {
          var property_types = properties[property_name].type,
              propertyFormat = (properties[property_name].format != undefined) ? properties[property_name].format : null;

          if (!(property_types instanceof Array)) {
              property_types = [property_types];
          }

          var column = predict.column(jsonSchema, property_index, property_name, property_types, propertyFormat, properties);
          columns.push(column);
      });

      let tableClass = changeCase.pascalCase(tableName),
          seederClass = `${tableClass}Seeder`;
      return {seederClass, tableClass, tableName, columns};
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
      let tableName = (options['table'] != undefined && typeof options['table'] === 'string') ? options['table'] : null;

      let settings = {tableName};
      return settings;
    },

    dest: './database/seeds'
};

module.exports = build;
