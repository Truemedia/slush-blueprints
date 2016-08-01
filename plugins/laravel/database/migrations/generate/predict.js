var observe = require('./observe');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
    /* Flag prediction submethods */
    flag: {
        // Primary key
        pk: function (pi, pn, pts) {
            return (
                observe.first(pi) && observe.is('id', pn) && observe.is('integer', pts)
            );
        },
        // Not null
        nn: function (pi, pn, pts) {
            return !observe.is('null', pts);
        },
        // Unique
        uq: function (pi, pn, pts) {
            return (
                predict.flag.pk(pi, pn, pts) && predict.flag.nn(pi, pn, pts)
            );
        },
        // Binary (file)
        // TODO: Implement
        bin: function (pi, pn, pts) {
            return false;
        },
        // Unsigned
        un: function (pi, pn, pts) {
            return observe.is('integer', pts);
        },
        // Zero filled
        // TODO: Implement
        zf: function (pi, pn, pts) {
            return false;
        },
        // Auto increment
        ai: function (pi, pn, pts) {
            return predict.flag.pk(pi, pn, pts);
        },
        // Generated column
        // TODO: Implement
        g: function (pi, pn, pts) {
            return false;
        }
    },

    /* Flag prediction based on patterns */
    flags: function(property_index, property_name, property_types) {
        var flag_options = {};

        for (flag in predict.flag)
        {
            flag_options[flag] = predict.flag[flag](property_index, property_name, property_types);
        }

        return flag_options;
    }
};

module.exports = predict;
