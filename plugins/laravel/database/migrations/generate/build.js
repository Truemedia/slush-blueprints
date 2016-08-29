// Dependencies
var changeCase = require('change-case'),
    File = require('vinyl'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path');
    argv = require('yargs').argv;

// Plugin libs
var defaults = require('./../defaults.json'),
    predict = require('./predict');

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
      * @param {Moment} instance - MomentJS instance
      * @param {string} table_name - Name of database table
      * @param {string} mode - Mode relevant to context of a magic migration
      */
    filename: function(migration_moment, table_name, mode) {
        if (mode == undefined)
        {
            mode = 'create';
        }

        var migration_datetime = migration_moment.format('YYYY_MM_DD_HHmmss');

        var filename = `${migration_datetime}_${mode}_${table_name}_table.php`;
        return filename;
    },

    /**
      * Extract template data from jsonSchema
      *
      * @param {json} jsonSchema - JSONschema instance
      * @param {json} options - Preconfigured options
      */
    templateData: function(jsonSchema, options) {
        // Iterate properties in schema
        var properties = jsonSchema.items.properties;

        var tableName = (options.tableName != undefined) ? options.tableName : predict.tableName(jsonSchema),
            columns = [];

        Object.keys(properties).forEach( function(property_name, property_index) {
            var property_types = properties[property_name].type;
            if (!(property_types instanceof Array)) {
                property_types = [property_types];
            }

            var column = predict.column(property_index, property_name, property_types, properties);
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
      * Build options
      *
      */
    options: function() {

        // Defaults
        var options = {
            tableName: null
        };

        if (argv['table'] != undefined && typeof argv['table'] === 'string') {
            options.tableName = argv['table'];
        }
        else if (argv['create'] != undefined && typeof argv['create'] === 'string') {
            options.tableName = argv['create'];
        };

        return options;
    }
};

module.exports = build;
