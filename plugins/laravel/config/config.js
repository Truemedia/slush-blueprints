var gutil = require('gulp-util'),
    FileQueue = require('filequeue'),
    fs = require('fs-extra'),
    path = require('path');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel config plugin for slush-blueprints **/
var config =
{
    /* Copy base files across */
    copy_base_files: function(cwd)
    {
        var filename = 'formatting.php',
            relative_path = path.join('config');

        fs.copy(path.join(cwd, 'templates', relative_path, filename), path.join('.', relative_path, filename), function (error)
        {
            if (error) throw error;
            var msg = 'Base config file/s copied successfully';
            gutil.log( gutil.colors.green(msg) );
        });
    },
};

module.exports = config;
