"use strict";

// Dependencies
var changeCase = require('change-case'),
    File = require('vinyl'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path');

// Plugin libs
var predict = require('./../helpers/predict');
var CoreBlueprint = require('./../../../../../../classes/blueprint');

class BaseBlueprint extends CoreBlueprint {
    /**
      * Settings
      *
      */
    set options (options) {
        var tableName = (options['table'] != undefined && typeof options['table'] === 'string') ? options['table'] : null;

        this.settings = {tableName};
    }

    /**
      * Extract template data from jsonSchema
      *
      * @param {json} jsonSchema - JSONschema instance
      * @param {json} settings - Preconfigured options
      */
    templateData (jsonSchema) {
        var properties = jsonSchema.items.properties;

        var tableName = (this.settings.tableName != null) ? this.settings.tableName : predict.tableName(jsonSchema),
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
        let templateData = {tableClassName, tableName, columns};
        return templateData;
    }

    /**
     * Format table column
     *
     * @param {string} name - Column name
     * @param {string} type - Column datatype
     * @param {boolean} flags - Column flags
     * @param {string} comment - Column comment
     * @param {string} parentTable - Name of parent table, column is relevant to
     */
    ftc (name, type, flags, comment, parentTable) {
        var name = changeCase.snakeCase(name),
            type = changeCase.camelCase(type),
            comment = changeCase.titleCase(comment);

        var column = {name, type, flags, comment};
        column.parentTable = (parentTable != undefined) ? parentTable : null;

        return column;
    }

    /**
      * Generate basename of file from provided parameters
      *
      * @param {Moment} instance - MomentJS instance
      * @param {string} table_name - Name of database table
      * @param {string} mode - Mode relevant to context of a magic migration
      */
    baseName (migrationMoment, tableName, ext, mode) {
        if (mode == undefined) { mode = 'create'; }

        let migrationDatetime = migrationMoment.format('YYYY_MM_DD_HHmmss');

        let baseName = `${migrationDatetime}_${mode}_${tableName}_table.${ext}`;
        return baseName;
    }
}

module.exports = BaseBlueprint;
