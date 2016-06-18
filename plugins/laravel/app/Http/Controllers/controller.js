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

  /**
   * Create a controller based on passed parameters
   */
   create: function(cwd, controllerName, parentControllerName, modelName, requestName, layoutName)
   {
       var filename = controllerName + '.php',
           relative_path = path.join('app', 'Http', 'Controllers');

       // Open model template file
       fq.readFile(path.join(cwd, 'templates', relative_path, 'Resources', 'Controller.php'), {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var template_data = {layoutName, controllerName, parentControllerName, modelName, requestName};
           var tpl = _.template(file_contents);
           var controller_file_contents = tpl(template_data);

           // Check if controller folder exists (Laravel instance)
           fq.exists(path.join('.', relative_path), function(path_exists)
           {
               if (path_exists)
               {
                   // Create Resources folder if it does not exist
                   var resource_controllers_path = path.join('.', relative_path, 'Resources');
                   if (!fs.existsSync(resource_controllers_path))
                   {
                       fs.mkdirSync(resource_controllers_path);
                   }

                   // Write controller file
                   fq.writeFile(path.join(resource_controllers_path, filename), controller_file_contents, function (error)
                   {
                       if (error) throw error;
                       controller.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Controller folder does not exist (' + relative_path + '), did you run this in the correct folder?') );
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

           var relative_path = path.join('app', 'Http', 'Controllers', 'Core'),
               src_path = path.join(cwd, 'templates', relative_path),
               dest_path = path.join('.', relative_path);

           // Create Resources folder if it does not exist
           if (!fs.existsSync(dest_path))
           {
               fs.mkdirSync(dest_path);
           }

           fs.copy(src_path, dest_path, function (error)
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
