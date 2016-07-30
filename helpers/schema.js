/* Schema helper */
var schema = {

    /* Observation functions */
    is: {
        possibly: function(option, options)
        {
            return (options.indexOf(option) > -1);
        },
        first: function(pi)
        {
            return (pi == 0);
        }
    },

    /* Prediction functions */
    predict: {

        /* Flag prediction submethods */
        flag: {
            // Primary key
            pk: function (pi, pn, pts) {
                return (
                    schema.is.first(pi) && schema.is.possibly('id', pn) && schema.is.possibly('integer', pts)
                );
            },
            // Not null
            nn: function (pi, pn, pts) {
                return !schema.is.possibly('null', pts);
            },
            // Unique
            uq: function (pi, pn, pts) {
                return (
                    schema.predict.flag.pk(pi, pn, pts) && schema.predict.flag.nn(pi, pn, pts)
                );
            },
            // Binary (file)
            // TODO: Implement
            bin: function (pi, pn, pts) {
                return false;
            },
            // Unsigned
            un: function (pi, pn, pts) {
                return schema.is.possibly('integer', pts);
            },
            // Zero filled
            // TODO: Implement
            zf: function (pi, pn, pts) {
                return false;
            },
            // Auto increment
            ai: function (pi, pn, pts) {
                return schema.predict.flag.pk(pi, pn, pts);
            },
            // Generated column
            // TODO: Implement
            g: function (pi, pn, pts) {
                return false;
            }
        },

        /* Column flag prediction based on patterns */
        flags: function(property_index, property_name, property_types) {
            var column_options = {};

            for (flag in schema.predict.flag)
            {
                column_options[flag] = schema.predict.flag[flag](property_index, property_name, property_types);
            }

            return column_options;
        }
    }
};

module.exports = schema;
