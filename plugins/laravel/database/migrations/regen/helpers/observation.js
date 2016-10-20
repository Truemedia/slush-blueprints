"use strict";

var Observational = require('./../../../../../../classes/observational');

/**
  * Make observations on jsonSchema
  */
class Observation extends Observational {
    constructor (jsonSchema) {
        super();
        this.schema = jsonSchema;
    }
    is (property, properties) {
        return (properties.indexOf(property) > -1);
    }
    first (property_index) {
        return (property_index == 0);
    }
    prefixedProperties () {
        return this.keysPrefixed(this.schema.items.properties);
    }
}

module.exports = Observation;
