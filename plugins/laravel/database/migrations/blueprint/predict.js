"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case'),
    glob = require('glob'),
    path = require('path'),
    config = require('super-config');

var Mapper = require('../../../../../classes/new_mapper');
config.loadConfig(glob.sync( path.join(__dirname, 'config/{column_types,map}.js') ));

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
    tableName: function(jsonSchema) {
        let tableName = null;
        let observation = new Observation(jsonSchema);

        // Use prefix (if available)
        let prefix = observation.prefixedProperties();
        if (prefix) {
            tableName = prefix;
        }
        return tableName;
    },

    column: function(jsonSchema, property_index, property_name, property_types, propertyFormat, properties) {
        let observation = new Observation(jsonSchema);
        let prefix = observation.prefixedProperties();

        var flags = predict.flags(property_index, property_name, property_types, properties),
            type = predict.column_type(property_name, property_types, propertyFormat, flags),
            name = predict.column_name(property_name, prefix, type),
            comment = predict.column_comment(property_name);

        let column = {comment, flags, name, type};
        return column;
    },

    /**
     * Column name
     */
    column_name: function(propertyName, prefix, type)
    {
      // Remove prefix (if applicable)
      let columnName = (prefix) ? propertyName.replace(`${prefix}_`, '') : propertyName;

      // Add underscore for id column if missing
      if (type == 'integer' && columnName != 'id' && columnName.indexOf('_id') == -1) {
        columnName = columnName.replace('id', '_id');
      }

      return columnName;
    },

    /**
     * Match schema primative datatypes to desired database datatypes for selected data source
     */
    column_type: function(propertyName, propertyTypes, propertyFormat, flags)
    {
        let propertyType = propertyTypes.pop(),
            columnTypes = config.get('column_types');

        // Map using properties
        let mapping = new Mapper(columnTypes);
        let columnType = mapping.match({
          type: propertyType, format: propertyFormat
        }, config.get('map'), 'type');

        // Remap using flags
        if (flags.pk) {
          columnType = 'increments';
        }

        return columnType;
    },

    /**
      * Comment
      */
    column_comment: function(property_name) {
        return changeCase.titleCase(property_name);
    },

    /* Flag prediction submethods */
    flag: {
        // Primary key
        pk: function (p_i, p_n, p_ts, p) {
            let observation = new Observation();
            return (
                observation.first(p_i) && observation.is('id', p_n) && observation.is('integer', p_ts)
            );
        },
        // Not null
        nn: function (p_i, p_n, p_ts, p) {
            let observation = new Observation();
            return !observation.is('null', p_ts);
        },
        // Unique
        uq: function (p_i, p_n, p_ts, p) {
            return (
                predict.flag.pk(p_i, p_n, p_ts) && predict.flag.nn(p_i, p_n, p_ts)
            );
        },
        // Binary (file)
        // TODO: Implement
        bin: function (p_i, p_n, p_ts, p) {
            return false;
        },
        // Unsigned
        un: function (p_i, p_n, p_ts, p) {
            let observation = new Observation();
            return observation.is('integer', p_ts);
        },
        // Zero filled
        // TODO: Implement
        zf: function (p_i, p_n, p_ts, p) {
            return false;
        },
        // Auto increment
        ai: function (p_i, p_n, p_ts, p) {
            return predict.flag.pk(p_i, p_n, p_ts);
        },
        // Generated column
        // TODO: Implement
        g: function (p_i, p_n, p_ts, p) {
            return false;
        }
    },

    /* Flag prediction based on patterns */
    flags: function(property_index, property_name, property_types, properties) {
        let flag_options = {};

        for (let flag in predict.flag)
        {
            flag_options[flag] = predict.flag[flag](property_index, property_name, property_types, properties);
        }

        return flag_options;
    }
};

module.exports = predict;
