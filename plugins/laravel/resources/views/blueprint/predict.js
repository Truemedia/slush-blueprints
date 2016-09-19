"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case'),
    config = require('super-config'),
    glob = require('glob');

var mapper = require('./../../../../../classes/mapper');
config.loadConfig(glob.sync( path.join(__dirname, 'config/*.js') ));

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
   * Match schema primative datatypes to desired database datatypes for selected data source
   */
  formFieldType: function(nativeTypes, propertyFormat)
  {
    let dataTypes = config.get('data_types'),
        nativeMappings = config.get('native_mappings');

      var nativeType = nativeTypes.pop(),
          formFieldType = null;

      // Match using type against native types
      var transformation = mapper.direct_datatype_transformation_match(dataTypes, nativeType);
      // Match using format against native types
      if (transformation == null) {
        transformation = mapper.direct_datatype_transformation_match(dataTypes, propertyFormat);
      }

      // Got a match for native type
      if (transformation != null) {
          nativeType = changeCase[transformation](nativeType);
      }

      // Map native type to view type
      var transformation = mapper.direct_datatype_transformation_match(config.get('input_types'), nativeType);

      if (transformation != null) {
          // Got a direct match
          formFieldType = changeCase[transformation](nativeType);
      }
      else if (Object.keys(nativeMappings).indexOf( changeCase.camelCase(nativeType) ) > -1) {
        formFieldType = nativeMappings[changeCase.camelCase(nativeType)];
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
    let formFieldName = predict.formFieldName(propertyName, prefix, type),
        formFieldLabel = changeCase.sentenceCase( pluralize.singular(formFieldName) );

      return formFieldLabel;
  },

  formFieldTableName: function()
  {
    return null;
  }
};

module.exports = predict;
