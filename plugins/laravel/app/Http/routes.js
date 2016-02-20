var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel routes plugin for slush-blueprints **/
var routes =
{
    traditional_logging: true,

  /**
   * Create a routes file based on passed parameters
   */
   create: function(cwd, resources)
   {
       var filename = 'routes.php',
           routes_path = 'app/Http';

       // Open routes template file
       fq.readFile(cwd + '/templates/' + routes_path + '/' + filename, {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

           var template_data = {
               "resources": resources,
           };

           var tpl = _.template(file_contents);
           var routes_file_contents = tpl(template_data);

           // Check if routes folder exists (Laravel instance)
           fq.exists(routes_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write routes file
                   fq.writeFile('./' + routes_path + '/' + filename, routes_file_contents, function (err)
                   {
                       if (error) throw error;
                       routes.made(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Routes folder does not exist (' + routes_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for routes being made */
   made: function(filename)
   {
       if (routes.traditional_logging)
       {
           var msg = 'Routes file ' + filename + ' created!';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = routes;
