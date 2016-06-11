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
var defaults = require('./../../../../../config/defaults.json');

/**
 * Laravel controller plugin for slush-blueprints **/
var controller =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,
    layout_name: 'basic',

  /**
   * Create a controller based on passed parameters
   */
   create: function(cwd, controllerName, parentControllerName, modelName, requestName)
   {
       // Open model template file
       fq.readFile(cwd + '/templates/app/Http/Controllers/Controller.php', {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = controllerName + '.php';

           var layoutName = controller.layout_name;
           var template_data = {layoutName, controllerName, parentControllerName, modelName, requestName};

           var tpl = _.template(file_contents);
           var controller_file_contents = tpl(template_data);
           var controller_path = 'app/Http/Controllers';

           // Check if controller folder exists (Laravel instance)
           fq.exists(controller_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write controller file
                   fq.writeFile('./' + controller_path + '/' + filename, controller_file_contents, function (error)
                   {
                       if (error) throw error;
                       controller.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Controller folder does not exist (' + controller_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Copy base files across */
   copy_base_files: function(cwd)
   {
       if (!controller.base_files_copied)
       {
           controller.base_files_copied = true;

           var filename = 'BaseController.php',
               relative_path = path.join('app', 'Http', 'Controllers');

           fs.copy(path.join(cwd, 'templates', relative_path, filename), path.join('.', relative_path, filename), function (error)
           {
               if (error) throw error;
               var msg = 'Base controller file/s copied successfully';
               gutil.log( gutil.colors.green(msg) );
           });
       }
   },

   /* Callback for controller being created */
   created: function(filename)
   {
       controller.counter++;

       if (controller.traditional_logging)
       {
           var msg = 'Controller file ' + filename + ' created! '
               + '(Controller ' + controller.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = controller;
