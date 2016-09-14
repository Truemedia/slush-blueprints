/* Gulp plugins, and Lazypipe */
var gulpPlugins = require('auto-plug')('gulp'),
	lazypipe = require('lazypipe');

/* Pipeline */
exports.pipeline = lazypipe()
	// .pipe(less)
    .pipe(gulpPlugins.sass);
