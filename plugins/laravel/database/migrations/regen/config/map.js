module.exports = {
  // Map schema properties to database column types
  map: [
    {
      "type": "string",
      "format": "date-time",
      "match": "dateTime"
    },
    {
      "type": "number",
      "format": null,
      "match": "boolean"
    }
  ]
};
