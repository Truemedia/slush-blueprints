"use strict";

var changeCase = require('change-case'),
    diff = require('deep-diff').diff;

/**
  * General utility class for mapping data
  */
 class Mapper {

   constructor (types) {
     this.types = types;
   }

     /**
       * Match any value in JSON object to specified map or close proximation
       */
     match (jsonObject, map, attributeName)
     {
       // Object is mappable
       for (let mappable of map) {
         let comparison = JSON.parse( JSON.stringify(mappable) );
         delete comparison.match;
         let changes = diff(jsonObject, comparison);
         if (changes === undefined) {
           return mappable.match
         }
       }

       // Attribute matches transform
       for (let transform in changeCase) {
         let transformed = changeCase[transform](jsonObject[attributeName]);
         if (this.types.indexOf(transformed) > -1) {
           return transformed;
         }
       }
     }
 }

 module.exports = Mapper;
