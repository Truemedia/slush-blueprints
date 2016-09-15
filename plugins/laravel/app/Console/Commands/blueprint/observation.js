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
}

module.exports = Observation;
