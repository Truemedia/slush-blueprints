var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel model plugin for slush-blueprints **/
var model =
{
    counter: 0,
    traditional_logging: true,

    /**
     * Get field name excluding provided suffix
     */
    get_field_name_without_suffix: function(field_name, suffix)
    {
        return field_name.replace(suffix, '');
    },

    /**
     * Determine class names of models and property functions included as fields
     */
    get_things: function(fields)
    {
        var things = [],
            identify_suffix = '_id';

        for (var field of fields)
        {
            if (field.name.indexOf(identify_suffix) > -1)
            {
                var property_function_name = model.get_field_name_without_suffix(field.name, '_id'),
                    model_name = changeCase.pascalCase(property_function_name);

                things.push({
                    "propertyFunctionName": property_function_name,
                    "modelName": model_name
                });
            }
        }

        return things;
    },

  /**
   * Create a migration based on passed parameters
   */
   create: function(cwd, model_name, parent_model_name, fields)
   {
       // Open model template file
       fq.readFile(cwd + '/templates/app/Model.php', {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

           var things = model.get_things(fields),
               filename = model_name + '.php';

           var template_data = {
               "modelName": model_name,
               "parentModelName": parent_model_name,
               "tableName": pluralize( changeCase.snakeCase(model_name) ),
               "parentTableName": pluralize( changeCase.snakeCase(parent_model_name) ),
               "fields": fields,
               "things": things
           };

           var tpl = _.template(file_contents);
           var model_file_contents = tpl(template_data);
           var model_path = 'app';

           // Check if model folder exists (Laravel instance)
           fq.exists(model_path, function(path_exists)
           {
               if (path_exists)
               {
                   // Write model file
                   fq.writeFile('./' + model_path + '/' + filename, model_file_contents, function (err)
                   {
                       if (error) throw error;
                       model.made(filename);
                   });
               }
               else
               {
                   throw new Error( gutil.colors.red('Model folder does not exist (' + model_path + '), did you run this in the correct folder?') );
               }
           });
       });
   },

   /* Callback for model being made */
   made: function(filename)
   {
       model.counter++;

       if (model.traditional_logging)
       {
           var msg = 'Model file ' + filename + ' created! '
               + '(Model ' + model.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = model;
