var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp');

var schema = require('./../helpers/schema');

gulp.task('schema', function()
{
    return gulp.src(['./schema.json'])
               .pipe( gulpPlugins.intercept( function(file) {

                   // Iterate columns in schema
                   var customSchema = JSON.parse( file.contents.toString() );
                   var columns = customSchema.items.properties;
                   Object.keys(columns).forEach( function(column_name, column_index) {
                       var column_types = columns[column_name].type;

                       console.log(column_name);
                       var flags = schema.predict.flags(column_index, column_name, column_types);
                       console.log(flags);
                   });
               }));
});
