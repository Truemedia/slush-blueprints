"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case');

var mapper = require('./../../../../classes/mapper');
var dataTypes = require('./datatypes.json');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
  tableName: function(jsonSchema)
  {
      let tableName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          tableName = changeCase.snakeCase( pluralize.plural(prefix) );
      }
      return tableName;
  },

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
  },

  parentTableName: function(jsonSchema)
  {
    // TODO: Add this logic
    return null;
  },

  parentModelName: function(jsonSchema)
  {
    // TODO: Add this logic
    return null;
  },

  attribute: function(jsonSchema, propertyIndex, propertyName, propertyTypes, propertyFormat, properties)
  {
      let observation = new Observation(jsonSchema);
      let prefix = observation.prefixedProperties();

      let type = predict.attributeType(propertyTypes, propertyFormat),
          name = predict.attributeName(propertyName, prefix, type),
          functionName = predict.attributeFunctionName(propertyName),
          modelName = predict.attributeModelName(propertyName);

      return {functionName, modelName, name, type};
  },

  /**
   * Attribute name
   */
  attributeName: function(propertyName, prefix, type)
  {
    // Remove prefix (if applicable)
    let attributeName = (prefix) ? propertyName.replace(`${prefix}_`, '') : propertyName;

    // Add underscore for id attribute if missing
    if (type == 'integer' && attributeName != 'id' && attributeName.indexOf('_id') == -1) {
      attributeName = attributeName.replace('id', '_id');
    }

    return attributeName;
  },

  /**
   * Match schema primative datatypes to desired database datatypes for selected data source
   */
  attributeType: function(nativeTypes, propertyFormat)
  {
      var nativeType = nativeTypes.pop(),
          attributeType = null;

      // Match using type
      var transformation = mapper.direct_datatype_transformation_match(dataTypes, nativeType);
      // Match using format
      if (transformation == null) {
        transformation = mapper.direct_datatype_transformation_match(dataTypes, propertyFormat);
      }

      // Got a direct match
      if (transformation != null)
      {
          attributeType = changeCase[transformation](nativeType);
      }

      return attributeType;
  },

  attributeFunctionName: function(propertyName) {
    return changeCase.camelCase( pluralize.singular(propertyName) );
  },

  attributeModelName: function(propertyName) {
    return changeCase.pascalCase( pluralize.singular(propertyName) );
  }
};

module.exports = predict;
