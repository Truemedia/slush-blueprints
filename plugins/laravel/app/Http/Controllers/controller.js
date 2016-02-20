var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel controller plugin for slush-blueprints **/
var controller =
{
    counter: 0,
    traditional_logging: true,

  /**
   * Create a controller based on passed parameters
   */
   create: function(cwd, controller_name, parent_controller_name)
   {
       // Open model template file
       fq.readFile(cwd + '/templates/app/Http/Controllers/Controller.php', {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = controller_name + '.php';

           var template_data = {
               "controllerName": controller_name,
               "parentControllerName": parent_controller_name,
           };

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
                       controller.made(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Controller folder does not exist (' + controller_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for controller being made */
   made: function(filename)
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
