"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case');

var mapper = require('./../../../../../classes/mapper');
var dataTypes = require('./datatypes');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {

  contextName: function(jsonSchema)
  {
      let contextName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          contextName = changeCase.sentenceCase( pluralize.singular(prefix) );
      }
      return contextName;
  },

  routeName: function(jsonSchema)
  {
      let routeName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          routeName = changeCase.snakeCase( pluralize.singular(prefix) );
      }
      return routeName;
  },

  resourceName: function(jsonSchema)
  {
      let resourceName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          resourceName = changeCase.snakeCase( pluralize.singular(prefix) );
      }
      return resourceName;
  },

  formField: function(jsonSchema, propertyIndex, propertyName, propertyTypes, propertyFormat, properties)
  {
      let observation = new Observation(jsonSchema);
      let prefix = observation.prefixedProperties();

      let type = predict.formFieldType(propertyTypes, propertyFormat),
          name = predict.formFieldName(propertyName, prefix, type),
          label = predict.formFieldLabel(propertyName, prefix, type),
          tableName = predict.formFieldTableName();

      return {name, label, tableName, type};
  },

  /**
   * Attribute name
   */
  formFieldName: function(propertyName, prefix, type)
  {
    // Remove prefix (if applicable)
    let formFieldName = (prefix) ? propertyName.replace(`${prefix}_`, '') : propertyName;

    // Add underscore for id formField if missing
    if (type == 'integer' && formFieldName != 'id' && formFieldName.indexOf('_id') == -1) {
      formFieldName = formFieldName.replace('id', '_id');
    }

    return formFieldName;
  },

  /**
   * Match schema primative datatypes to desired database datatypes for selected data source
   */
  formFieldType: function(nativeTypes, propertyFormat)
  {
      var nativeType = nativeTypes.pop(),
          formFieldType = null;

      // Match using type
      var transformation = mapper.direct_datatype_transformation_match(dataTypes, nativeType);
      // Match using format
      if (transformation == null) {
        transformation = mapper.direct_datatype_transformation_match(dataTypes, propertyFormat);
      }

      // Got a direct match
      if (transformation != null)
      {
          formFieldType = changeCase[transformation](nativeType);
      }

      return formFieldType;
  },

  /**
   * Attribute name
   */
  formFieldName: function(propertyName, prefix, type)
  {
    // Remove prefix (if applicable)
    let formFieldName = (prefix) ? propertyName.replace(`${prefix}_`, '') : propertyName;

    // Add underscore for id in form field if missing
    if (type == 'integer' && formFieldName != 'id' && formFieldName.indexOf('_id') == -1) {
      formFieldName = formFieldName.replace('id', '_id');
    }

    return formFieldName;
  },

  formFieldLabel: function(propertyName, prefix, type)
  {
      let resourceName = null;

      // Use prefix (if available)
      if (prefix) {
          resourceName = changeCase.sentenceCase( pluralize.singular(prefix) );
      }
      return resourceName;
  },

  formFieldTableName: function()
  {
    return null;
  }
};

module.exports = predict;
