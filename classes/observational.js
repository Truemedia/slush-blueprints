"use strict";
/**
  * General utility class for making observations on data
  */
 class Observational {

   constructor (prefix) {
     if (prefix == undefined) {
       var prefix = 50;
     }
     this.tolerance = {prefix};
   }

     /**
       * Check if array keys have same prefix (with percentage tolerance)
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

         let match_percentage = ((matches + 1) / Object.keys(jsonObject).length) * 100;
         return (
           (match_percentage >= this.tolerance.prefix) ? prefix : false
         );
     }
 }

 module.exports = Observational;
