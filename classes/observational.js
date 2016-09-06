"use strict";
/**
  * General utility class for making observations on data
  */
 class Observational {
     /**
       * Check if all array keys have same prefix
       */
     keysPrefixed (jsonObject) {
         var prefix = null,
             matches = 0,
             seperator = '_';

         for (let item in jsonObject) {
             var segments = item.split(seperator);

             if (prefix == null) {
                 prefix = segments[0];
             }
             else if (prefix == segments[0]) {
                 matches++;
             }
         }

         return ((Object.keys(jsonObject).length == (matches + 1)) ? prefix : false);
     }
 }

 module.exports = Observational;
