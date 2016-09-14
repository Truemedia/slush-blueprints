/* Gulp plugins, and Lazypipe */
var gulpPlugins = require('auto-plug')('gulp'),
	lazypipe = require('lazypipe'),
	autoprefixer = require('autoprefixer');
	cssnano = require('cssnano');

var processors = [
	autoprefixer({browsers: ['last 1 version']}),
	cssnano({discardComments: { removeAll: true } }),
];

/* Pipeline */
exports.pipeline = lazypipe()
	// .pipe(less)
    .pipe(gulpPlugins.sass)
		.pipe(gulpPlugins.postcss, processors);
