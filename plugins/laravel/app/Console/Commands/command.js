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
 * Laravel command plugin for slush-blueprints **/
var command =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,

  /**
   * Create a command based on passed parameters
   */
   create: function(cwd, commandName, signatureName, description, modelName)
   {
       var filename = commandName + '.php',
           relative_path = path.join('app', 'Console', 'Commands');

       // Open command template file
       fq.readFile(path.join(cwd, 'templates', relative_path, 'Command.php'), {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var template_data = {commandName, signatureName, description, modelName};
           var tpl = _.template(file_contents);
           var command_file_contents = tpl(template_data);

           // Check if command folder exists (Laravel instance)
           fq.exists(path.join('.', relative_path), function(path_exists)
           {
               if (path_exists)
               {
                   // Write command file
                   fq.writeFile(path.join('.', relative_path, filename), command_file_contents, function (error)
                   {
                       if (error) throw error;
                       command.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Command folder does not exist (' + command_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Copy base files across */
   copy_base_files: function(cwd, commands)
   {
       if (!command.base_files_copied)
       {
           command.base_files_copied = true;

           var filename = 'Kernel.php',
               relative_path = path.join('app', 'Console');

           // Open routes template file
           fq.readFile(path.join(cwd, 'templates', relative_path, filename), {encoding: defaults.encoding}, function (error, file_contents)
           {
               if (error) throw error;
               var template_data = {commands};
               var tpl = _.template(file_contents);
               var kernel_file_contents = tpl(template_data);


                // Write routes file
                fq.writeFile(path.join('.', relative_path, filename), kernel_file_contents, function (err)
                {
                   if (error) throw error;
                   var msg = 'Kernel file copied successfully';
                   gutil.log( gutil.colors.green(msg) );
                });
           });
       }
   },

   /* Callback for command being created */
   created: function(filename)
   {
       command.counter++;

       if (command.traditional_logging)
       {
           var msg = 'Command file ' + filename + ' created! '
               + '(Command ' + command.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = command;
