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
     * Format table column
     *
     * @param {string} name - Column name
     * @param {string} type - Column datatype
     * @param {boolean} flags - Column flags
     * @param {string} comment - Column comment
     * @param {string} parentTable - Name of parent table, column is relevant to
     */
    ftc: function(name, type, flags, comment, parentTable) {
        var name = changeCase.snakeCase(name),
            type = changeCase.camelCase(type),
            comment = changeCase.titleCase(comment);

        var column = {name, type, flags, comment};
        column.parentTable = (parentTable != undefined) ? parentTable : null;

        return column;
    },

    /**
      * Generate filename from provided parameters
      *
      * @param {string} fileExtension - File extension
      * @param {Moment} instance - MomentJS instance
      * @param {string} table_name - Name of database table
      * @param {string} mode - Mode relevant to context of a magic migration
      */
    filename: function(fileExtension, migration_moment, table_name, mode) {
        if (mode == undefined)
        {
            mode = 'create';
        }

        var migration_datetime = migration_moment.format('YYYY_MM_DD_HHmmss');

        var filename = `${migration_datetime}_${mode}_${table_name}_table.${fileExtension}`;
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
        Object.keys(properties).forEach( function(propertyName, propertyIndex) {
            let propertyFormat = (properties[propertyName].format != undefined) ? properties[propertyName].format : null;

            let propertyTypes = (properties[propertyName].type instanceof Array)
              ? new Set(properties[propertyName].type)
              : new Set([properties[propertyName].type]);

            var column = predict.column(jsonSchema, propertyIndex, propertyName, propertyTypes, propertyFormat, properties);
            columns.push(column);
        });

        var tableClassName = changeCase.pascalCase(tableName);
        return {tableClassName, tableName, columns};
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
        var tableName = (options['table'] != undefined && typeof options['table'] === 'string') ? options['table'] : null;

        var settings = {tableName};
        return settings;
    },

    dest: './database/migrations/'
};

module.exports = build;
