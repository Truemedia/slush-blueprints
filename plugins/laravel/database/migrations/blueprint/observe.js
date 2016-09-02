/**
  * Make observations of provided data
  */

var observe = {
    is: function(property, properties) {
        return (properties.indexOf(property) > -1);
    },

    first: function(property_index) {
        return (property_index == 0);
    },
    /**
      * Check if all array keys have same prefix
      */
    keys_prefixed: function(properties) {
        var prefix = null,
            matches = 0,
            seperator = '_';

        for (property in properties) {
            var segments = property.split(seperator);

            if (prefix == null) {
                prefix = segments[0];
            }
            else if (prefix == segments[0]) {
                matches++;
            }
        }

        return ((Object.keys(properties).length == (matches + 1)) ? prefix : false);
    }
};

module.exports = observe;
