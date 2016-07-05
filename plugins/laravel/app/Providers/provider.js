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
 * Laravel provider plugin for slush-blueprints **/
var provider =
{
    counter: 0,
    traditional_logging: true,

  /**
   * Create an auth provider based on passed parameters
   */
   create_auth_provider: function(cwd, policies)
   {
       // Open provider template file
       var filename = 'AuthServiceProvider.php',
           relative_path = path.join('app', 'Providers');

       var superAdmin = 'Super Admin'; // TODO: Make this an option


       fq.readFile(path.join(cwd, 'templates', relative_path, filename), {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var template_data = {policies, superAdmin};
           var tpl = _.template(file_contents);
           var provider_file_contents = tpl(template_data);

           // Check if provider folder exists (Laravel instance)
           fq.exists(relative_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write provider file
                   fq.writeFile(path.join('.', relative_path, filename), provider_file_contents, function (error)
                   {
                       if (error) throw error;
                       provider.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Provider folder does not exist (' + relative_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for provider being created */
   created: function(filename)
   {
       provider.counter++;

       if (provider.traditional_logging)
       {
           var msg = 'Provider file ' + filename + ' created! '
               + '(Provider ' + provider.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = provider;
