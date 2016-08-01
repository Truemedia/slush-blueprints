// Dependencies
var path = require('path'),
    File = require('vinyl');

var predict = require('./predict');

var build = {
    /**
      * Generate a Laravel migration using data provided
      */
    generate: function(jsonSchema)
    {
        // Iterate properties in schema
        var properties = jsonSchema.items.properties;

        Object.keys(properties).forEach( function(property_name, property_index) {
            var property_types = properties[property_name].type;

            console.log(property_name);
            var flags = predict.flags(property_index, property_name, property_types);
            console.log(flags);
        });

        return new File({
            contents: new Buffer('hello world'),
            path: path.join('.', 'migration.php')
        });
    },
};

module.exports = build;
