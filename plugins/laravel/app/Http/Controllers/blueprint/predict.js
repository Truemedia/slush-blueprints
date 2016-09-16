"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case'),
    pluralize = require('pluralize');

var mapper = require('./../../../../../../classes/mapper');

/**
  * Predict how controllers will be built using only data provided
  */
var predict = {
  modelName: function(jsonSchema) {
      let modelName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          modelName = changeCase.pascalCase( pluralize.singular(prefix) );
      }
      return modelName;
  },
  resourceName: function(jsonSchema) {
      let resourceName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          resourceName = changeCase.paramCase( pluralize.singular(prefix) );
      }
      return resourceName;
  }
};

module.exports = predict;
