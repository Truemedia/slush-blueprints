/* Gulp plugins, and Lazypipe */
var jshint = require('gulp-jshint'),
	lazypipe = require('lazypipe');

/* Pipeline */
exports.pipeline = lazypipe()
	.pipe(jshint)
	.pipe(jshint.reporter, 'default');