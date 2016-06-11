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
 * Laravel request plugin for slush-blueprints **/
var request =
{
    counter: 0,
    traditional_logging: true,

  /**
   * Create a request based on passed parameters
   */
   create: function(cwd, requestName, modelName)
   {
       // Open request template file
       fq.readFile(cwd + '/templates/app/Http/Requests/Request.php', {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = requestName + '.php';
               template_data = {requestName, modelName};

           var tpl = _.template(file_contents);
           var request_file_contents = tpl(template_data);
           var request_path = 'app/Http/Requests';

           // Check if request folder exists (Laravel instance)
           fq.exists(request_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write request file
                   fq.writeFile('./' + request_path + '/' + filename, request_file_contents, function (error)
                   {
                       if (error) throw error;
                       request.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Request folder does not exist (' + request_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for request being created */
   created: function(filename)
   {
       request.counter++;

       if (request.traditional_logging)
       {
           var msg = 'Request file ' + filename + ' created! '
               + '(Request ' + request.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = request;
