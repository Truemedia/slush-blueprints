/* Gulp plugins, and Lazypipe */
var gulpPlugins = require('auto-plug')('gulp'),
    imageminPlugins = require('auto-plug')('imagemin')
	lazypipe = require('lazypipe');

// var processors = [
//   imageminPlugins.pngquant
// ];

/* Pipeline */
exports.pipeline = lazypipe()
  .pipe(gulpPlugins.imagemin);
