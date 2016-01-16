var _ = require('underscore'),
    changeCase = require('change-case'),
    fs = require('fs'),
    pluralize = require('pluralize');

/**
 * Laravel model plugin for slush-blueprints **/
var model =
{
  /**
   * Create a migration based on passed parameters
   */
   create: function(cwd, model_name, parent_model_name, field_names)
   {
     var file_contents = fs.readFileSync(cwd + '/templates/Model.php', {encoding: 'utf8'});

     if (file_contents == undefined)
     {
         throw new Error('Error loading file');
     }

     var filename = model_name + '.php';

     var template_data = {
         "modelName": model_name,
         "parentModelName": parent_model_name,
         "tableName": pluralize( changeCase.snakeCase(model_name) ),
         "parentTableName": pluralize( changeCase.snakeCase(parent_model_name) ),
         "fieldNames": field_names
     };

     var tpl = _.template(file_contents);
     var model_file_contents = tpl(template_data);
     var model_path = 'app';

     fs.open(model_path, 'r', function(err, fd)
     {
       if (err && err.code=='ENOENT')
       {
         throw new Error( gutil.colors.red('Model folder does not exist (' + model_path + '), did you run this in the correct folder?') );
       }
     });

     fs.writeFileSync('./' + model_path + '/' + filename, model_file_contents);
     return true;
   },
};

module.exports = model;
