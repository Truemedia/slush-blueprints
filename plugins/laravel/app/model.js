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
var defaults = require('./../../../config/defaults.json');

/**
 * Laravel model plugin for slush-blueprints **/
var model =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,

    // Used to exclude tables that might have bugs in the RDFa or conflicts with Laravel/Common packages
    problematic_models: ['Role'],

    /**
     * Determine class names of models and property functions included as fields
     */
    get_things: function(fields)
    {
        var things = [];

        for (var field of fields)
        {
            if (field.parent_table != null)
            {
                var property_function_name = field.name;
                    model_name = changeCase.pascalCase( pluralize(field.parent_table, 1) ); // Gets singular name

                things.push({
                    "propertyFunctionName": property_function_name,
                    "modelName": model_name
                });
            }
        }

        return things;
    },

    /* Copy base files across */
    copy_base_files: function(cwd)
    {
        if (!model.base_files_copied)
        {
            model.base_files_copied = true;

            var entrust_models = ['Permission.php', 'Role.php', 'User.php'];
                relative_path = path.join('app');

            for (model_filename of entrust_models)
            {
                fs.copy(path.join(cwd, 'templates', relative_path, model_filename), path.join('.', relative_path, model_filename), function (error)
                {
                    if (error) throw error;
                    var msg = 'Entrust model file/s copied successfully';
                    gutil.log( gutil.colors.green(msg) );
                });
            }

        }
    },

  /**
   * Create a model based on passed parameters
   */
   create: function(cwd, model_name, parent_model_name, fields, df)
   {
       // Open model template file
       fq.readFile(cwd + '/templates/app/Model.php', {encoding: defaults.encoding}, function (error, file_contents)
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
               "things": things,
               "df": df
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
