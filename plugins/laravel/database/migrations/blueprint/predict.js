"use strict";

var Observation = require('./observation'),
    dataTypes = require('./datatypes.json'),
    changeCase = require('change-case');

var mapper = require('../../../../../classes/mapper');

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

    column: function(property_index, property_name, property_types, properties) {
        var flags = predict.flags(property_index, property_name, property_types, properties),
            name = property_name,
            type = predict.column_type(property_types),
            comment = predict.column_comment(property_name);

        return {comment, flags, name, type};
    },

    /**
     * Match schema primative datatypes to desired database datatypes for selected data source
     */
    column_type: function(nativeTypes)
    {
        var nativeType = nativeTypes.pop(),
            column_type = null;

        // Direct datatype match
        var transformation = mapper.direct_datatype_transformation_match(dataTypes, nativeType);

        if (transformation != null)
        {
            // Got a direct match
            column_type = changeCase[transformation](nativeType);
        }

        return column_type;
    },

    /**
      * Comment
      */
    column_comment: function(property_name) {
        return property_name;
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
    },

    /* Datatype prediction based on patterns */
    datatype: function(property_index, property_name, property_types, properties) {

    }
};

module.exports = predict;
