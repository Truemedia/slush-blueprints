
var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp'),
    Validator = require('jsonschema').Validator;

/* Validate JSONschema */
gulp.task('validate', function() {
	return gulp.src(['./schema.json'])
               .pipe( gulpPlugins.intercept( function(file) {
                   var v = new Validator(),
                       version = 4;
                       schema = file.contents;

                       v.validate(version, schema);
                       gulpPlugins.util.log( gulpPlugins.util.colors.green(`Valid, all good!`) );
               }));
});
