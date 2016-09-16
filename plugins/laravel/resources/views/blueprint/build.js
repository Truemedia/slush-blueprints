"use strict";

// Dependencies
var changeCase = require('change-case'),
    File = require('vinyl'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    config = require('super-config'),
    glob = require('glob');

// Plugin libs
var predict = require('./predict');

config.loadConfig(glob.sync( path.join(__dirname, '../config/{input_types,form_elements}.js') ));

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

      let contextName = (settings.contextName != undefined) ? settings.contextName : predict.contextName(jsonSchema),
          resourceName = (settings.resourceName != undefined) ? settings.resourceName : predict.resourceName(jsonSchema),
          routeName = predict.routeName(jsonSchema),
          inputTypes = config.get('input_types'),
          formElements = config.get('form_elements'),
          formFields = [];

      // Iterate properties in schema
      Object.keys(properties).forEach( function(property_name, property_index) {
          var property_types = properties[property_name].type,
              propertyFormat = (properties[property_name].format != undefined) ? properties[property_name].format : null;

          if (!(property_types instanceof Array)) {
              property_types = [property_types];
          }

          var formField = predict.formField(jsonSchema, property_index, property_name, property_types, propertyFormat, properties);
          formFields.push(formField);
      });

      return {contextName, resourceName, routeName, inputTypes, formElements, formFields};
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
      let contextName = (options['context'] != undefined && typeof options['context'] === 'string') ? options['context'] : null,
          resourceName = (options['resource'] != undefined && typeof options['resource'] === 'string') ? options['resource'] : null;

      return {contextName, resourceName};
    },

    dest: './resources/views'
};

module.exports = build;
