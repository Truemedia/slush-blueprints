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
 * Laravel policy plugin for slush-blueprints **/
var policy =
{
    counter: 0,
    traditional_logging: true,

  /**
   * Create a policy based on passed parameters
   */
   create: function(cwd, policyName, modelName, modelInstanceName, resourceName)
   {
       // Open policy template file
       fq.readFile(cwd + '/templates/app/Policies/Policy.php', {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = policyName + '.php';
               template_data = {policyName, modelName, modelInstanceName, resourceName};

           var tpl = _.template(file_contents);
           var policy_file_contents = tpl(template_data);
           var policy_path = 'app/Policies';

           // Check if policy folder exists (Laravel instance)
           fq.exists(policy_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write policy file
                   fq.writeFile('./' + policy_path + '/' + filename, policy_file_contents, function (error)
                   {
                       if (error) throw error;
                       policy.created(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Policy folder does not exist (' + policy_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for policy being created */
   created: function(filename)
   {
       policy.counter++;

       if (policy.traditional_logging)
       {
           var msg = 'Policy file ' + filename + ' created! '
               + '(Policy ' + policy.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = policy;
