"use strict";

var Observation = require('./observation'),
    changeCase = require('change-case'),
    glob = require('glob'),
    path = require('path'),
    config = require('super-config');

config.loadConfig(glob.sync( path.join(__dirname, 'config/{column_types,map}.js') ));
var Mapper = require('./../../../../../classes/new_mapper');

/**
  * Predict how migrations will be built using only data provided
  */
var predict = {
  tableName: function(jsonSchema) {
      let tableName = null;
      let observation = new Observation(jsonSchema);

      // Use prefix (if available)
      let prefix = observation.prefixedProperties();
      if (prefix) {
          tableName = prefix;
      }
      return tableName;
  },

  column: function(jsonSchema, property_index, property_name, property_types, propertyFormat, properties) {
      let observation = new Observation(jsonSchema);
      let prefix = observation.prefixedProperties();

      let type = predict.column_type(property_name, property_types, propertyFormat),
          name = predict.column_name(property_name, prefix, type),
          comment = predict.column_comment(property_name);

      let column = {comment, name, type};
      return column;
  },

  /**
   * Column name
   */
  column_name: function(propertyName, prefix, type)
  {
    // Remove prefix (if applicable)
    let columnName = (prefix) ? propertyName.replace(`${prefix}_`, '') : propertyName;

    // Add underscore for id column if missing
    if (type == 'integer' && columnName != 'id' && columnName.indexOf('_id') == -1) {
      columnName = columnName.replace('id', '_id');
    }

    return columnName;
  },

  /**
   * Match schema primative datatypes to desired database datatypes for selected data source
   */
  column_type: function(propertyName, propertyTypes, propertyFormat)
  {
      let propertyType = propertyTypes.pop(),
          columnTypes = config.get('column_types');

      let mapping = new Mapper(columnTypes);
      let columnType = mapping.match({
        type: propertyType, format: propertyFormat
      }, config.get('map'), 'type');

      return columnType;
  },

  /**
    * Comment
    */
  column_comment: function(property_name) {
      return property_name;
  }
};

module.exports = predict;
