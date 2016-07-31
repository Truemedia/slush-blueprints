// Dependencies
var path = require('path'),
    File = require('vinyl');

var migration = {

    /**
      * Generate a Laravel migration using data provided
      */
    generate: function(jsonSchema)
    {
        // Iterate properties in schema
        var columns = jsonSchema.items.properties;

        Object.keys(columns).forEach( function(column_name, column_index) {
            var column_types = columns[column_name].type;

            console.log(column_name);
            var flags = migration.predict.flags(column_index, column_name, column_types);
            console.log(flags);
        });

        return new File({
            contents: new Buffer('hello world'),
            path: path.join('.', 'migration.php')
        });
    },

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
                    migration.is.first(pi) && migration.is.possibly('id', pn) && migration.is.possibly('integer', pts)
                );
            },
            // Not null
            nn: function (pi, pn, pts) {
                return !migration.is.possibly('null', pts);
            },
            // Unique
            uq: function (pi, pn, pts) {
                return (
                    migration.predict.flag.pk(pi, pn, pts) && migration.predict.flag.nn(pi, pn, pts)
                );
            },
            // Binary (file)
            // TODO: Implement
            bin: function (pi, pn, pts) {
                return false;
            },
            // Unsigned
            un: function (pi, pn, pts) {
                return migration.is.possibly('integer', pts);
            },
            // Zero filled
            // TODO: Implement
            zf: function (pi, pn, pts) {
                return false;
            },
            // Auto increment
            ai: function (pi, pn, pts) {
                return migration.predict.flag.pk(pi, pn, pts);
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

            for (flag in migration.predict.flag)
            {
                column_options[flag] = migration.predict.flag[flag](property_index, property_name, property_types);
            }

            return column_options;
        }
    }
};

module.exports = migration;
