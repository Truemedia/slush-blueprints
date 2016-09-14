/* Gulp plugins, and Lazypipe */
var sass = require('gulp-sass'),
	lazypipe = require('lazypipe');

/* Pipeline */
exports.pipeline = lazypipe()
	// .pipe(less)
    .pipe(sass);
