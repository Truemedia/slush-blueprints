var observe = require('./observe'),
    dataTypes = require('./datatypes.json'),
    changeCase = require('change-case');
    mapper = require('../../../../../classes/mapper');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
    tableName: function(jsonSchema) {
        var tableName = null;

        // Use prefix (if available)
        if (prefix = observe.keys_prefixed(jsonSchema.items.properties)) {
            tableName = prefix;
        }
        return tableName;
    },

    column: function(property_index, property_name, property_types, properties) {
        var flags = predict.flags(property_index, property_name, property_types, properties);
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
            return (
                observe.first(p_i) && observe.is('id', p_n) && observe.is('integer', p_ts)
            );
        },
        // Not null
        nn: function (p_i, p_n, p_ts, p) {
            return !observe.is('null', p_ts);
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
            return observe.is('integer', p_ts);
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
        var flag_options = {};

        for (flag in predict.flag)
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
