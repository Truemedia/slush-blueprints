var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue'),
    fs = require('fs'),
    path = require('path');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel views plugin for slush-blueprints
 * This is using CRUDL architecture with regular PHP templating
 **/
var view =
{
    counter: 0,
    traditional_logging: true,

    // Different attributes for input type (for automatic browser UIs)
    input_types: [
        'email', 'password', 'search', 'text', 'url', 'tel', 'number', 'range', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'color'
    ],

  /**
   * Create a view based on passed parameters
   */
   create: function(cwd, context_name, parent_context_name, form_fields)
   {
       // Open model template file
       fq.readFile(cwd + '/templates/resources/views/thing/crudl/_form.php', {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = '_form.php';

           var template_data = {
               "contextName": context_name,
               "parentContextName": parent_context_name,
               "formFields": form_fields,
               "inputTypes": view.input_types
           };

           var tpl = _.template(file_contents);
           var view_file_contents = tpl(template_data);

           var view_path = 'resources/views',
               context_path = changeCase.lowerCase(context_name);

           // Check if views folder exists (Laravel instance)
           fq.exists(view_path, function(path_exists)
           {
               if (path_exists)
               {
                   view_path = path.join(view_path, context_path);

                   // Create context folder if it does not exist
                   if (!fs.existsSync(view_path))
                   {
                       fs.mkdirSync(view_path);
                   }

                   // Write view file
                   fq.writeFile(path.join(view_path, filename), view_file_contents, function (err)
                   {
                       if (error) throw error;
                       view.made(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Views folder does not exist (' + view_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for view being made */
   made: function(filename)
   {
       view.counter++;

       if (view.traditional_logging)
       {
           var msg = 'View file ' + filename + ' created! '
               + '(View ' + view.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = view;
