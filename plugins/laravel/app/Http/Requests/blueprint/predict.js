"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case');

var mapper = require('./../../../../../../classes/mapper');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
  modelName: function(jsonSchema)
  {
      let modelName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          modelName = changeCase.pascalCase( pluralize.singular(prefix) );
      }
      return modelName;
  }
};

module.exports = predict;
