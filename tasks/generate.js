var gulp = require('gulp'),
    gulpPlugins = require('auto-plug')('gulp');

var migration = require('./../plugins/laravel/database/migrations/plugin');

/* Generate */
function generate(context) {
    return gulp.src(['./schema.json'])
               .pipe( migration() )
               .pipe( gulp.dest('./') );
}

gulp.task('generate-migration', function() { return generate('migration') }); // Generate migration/s
