/**
  * Make observations of provided data
  */

var observe = {
    is: function(property, properties) {
        return (properties.indexOf(property) > -1);
    },
    first: function(property_index)
    {
        return (property_index == 0);
    }
};

module.exports = observe;
