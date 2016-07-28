/* Schema helper */
var schema = {

    /* Observation functions */
    is: {
        possibly: function(option, options)
        {
            return (options.indexOf(option) > -1);
        },
        first: function(ci)
        {
            return (ci == 0);
        }
    },

    /* Prediction functions */
    predict: {

        /* Flag prediction submethods */
        flag: {
            // Primary key
            pk: function (ci, cn, cts) {
                return (
                    schema.is.first(ci) && schema.is.possibly('id', cn) && schema.is.possibly('integer', cts)
                );
            },
            // Not null
            nn: function (ci, cn, cts) {
                return !schema.is.possibly('null', cts);
            },
            // Unique
            uq: function (ci, cn, cts) {
                return (
                    schema.predict.flag.pk(ci, cn, cts) && schema.predict.flag.nn(ci, cn, cts)
                );
            },
            // Binary (file)
            // TODO: Implement
            bin: function (ci, cn, cts) {
                return false;
            },
            // Unsigned
            un: function (ci, cn, cts) {
                return schema.is.possibly('integer', cts);
            },
            // Zero filled
            // TODO: Implement
            zf: function (ci, cn, cts) {
                return false;
            },
            // Auto increment
            ai: function (ci, cn, cts) {
                return schema.predict.flag.pk(ci, cn, cts);
            },
            // Generated column
            // TODO: Implement
            g: function (ci, cn, cts) {
                return false;
            }
        },

        /* Column flag prediction based on patterns */
        flags: function(column_index, column_name, column_types) {
            var column_options = {};

            for (flag in schema.predict.flag)
            {
                column_options[flag] = schema.predict.flag[flag](column_index, column_name, column_types);
            }

            return column_options;
        }
    }
};

module.exports = schema;
