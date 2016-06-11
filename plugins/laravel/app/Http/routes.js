var _ = require('underscore'),
    changeCase = require('change-case'),
    gutil = require('gulp-util'),
    jsonfile = require('jsonfile'),
    pluralize = require('pluralize'),
    FileQueue = require('filequeue');

// Queue
var fq = new FileQueue(256);

// Configs
var defaults = require('./../../../../config/defaults.json');

/**
 * Laravel routes plugin for slush-blueprints **/
var routes =
{
    traditional_logging: true,
    base_files_copied: false,

    /* Copy base files across */
    copy_base_files: function(list_of_things)
    {
        if (!routes.base_files_copied)
        {
            routes.base_files_copied = true;
            routes.write_list_to_json(list_of_things);
        }
    },

  /**
   * Create a routes file based on passed parameters
   */
   create: function(cwd, resources)
   {
       var filename = 'routes.php',
           routes_path = 'app/Http';

       // Open routes template file
       fq.readFile(cwd + '/templates/' + routes_path + '/' + filename, {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           resources = routes.trim_route_names(resources);
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

   /* Trim routes that are longer than the route name limit (32 for laravel) */
   trim_route_names: function(resources)
   {
     for (route_name in resources)
     {
         // Route to trim
         if (route_name.length > 32)
         {
             // Try sliming down by removing vowels
             var new_route_name = route_name.replace(/[aeiou]/ig, '');
             if (new_route_name.length > 32)
             {
                 console.log(new_route_name);
                 throw new Error('Route name is too long (32 characters max!)');
            }
            else
            {
                var controller_name = resources[route_name];

                delete resources[route_name];

                resources[new_route_name] = controller_name;
            }
         }
     }

     return resources;
   },

   /* Callback for routes being made */
   made: function(filename)
   {
       if (routes.traditional_logging)
       {
           var msg = 'Routes file ' + filename + ' created!';
           gutil.log( gutil.colors.green(msg) );
       }
   },

   /* Write list of things to JSON file (used for several purposes) */
   write_list_to_json: function(list_of_things)
   {
       jsonfile.writeFile('regeneration.json', list_of_things, function(error)
       {
           if (error != null)
           {
               throw new Error(error);
           }
           else
           {
               gutil.log( gutil.colors.green('Saved JSON file containing things') );
           }
       })
   }
};

module.exports = routes;
