var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue'),
    fs = require('fs-extra'),
    path = require('path');

// Queue
var fq = new FileQueue(256);

// Configs
var defaults = require('./../../../../config/defaults.json');

/**
 * Laravel handler plugin for slush-blueprints **/
var handler =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,

   /* Copy base files across */
   copy_base_files: function(cwd, handlers)
   {
       if (!handler.base_files_copied)
       {
           handler.base_files_copied = true;

           var filename = 'Handler.php',
               relative_path = path.join('app', 'Exceptions');

           // Open handler template file
           fq.readFile(path.join(cwd, 'templates', relative_path, filename), {encoding: defaults.encoding}, function (error, file_contents)
           {
               if (error) throw error;
               var template_data = {handlers};
               var tpl = _.template(file_contents);
               var handler_file_contents = tpl(template_data);


                // Write handler file
                fq.writeFile(path.join('.', relative_path, filename), handler_file_contents, function (err)
                {
                   if (error) throw error;
                   var msg = 'Handler file copied successfully';
                   gutil.log( gutil.colors.green(msg) );
                });
           });
       }
   },

   /* Callback for handler being created */
   created: function(filename)
   {
       handler.counter++;

       if (handler.traditional_logging)
       {
           var msg = 'Handler file ' + filename + ' created! '
               + '(Handler ' + handler.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = handler;
