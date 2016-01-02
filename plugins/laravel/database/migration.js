var _ = require('underscore'),
    changeCase = require('change-case'),
    fs = require('fs'),
    moment = require('moment');

/**
 * Laravel migration plugin for slush-blueprints **/
var migration =
{
  /**
   * Create a migration based on passed parameters
   */
   create: function(cwd, table_name, fields_as_json)
   {
     var file_contents = fs.readFileSync(cwd + '/templates/migration/create_table.php', {encoding: 'utf8'});

     if (file_contents == undefined)
     {
         throw new Error('Error loading file');
     }

     var filename = moment().format('YYYY_MM_DD_HHmmss') + '_create_' + table_name + '_table.php';

     var template_data = {
         "packageNameCamelCase": changeCase.camelCase(table_name),
         "packageNamePascalCase": changeCase.pascalCase(table_name),
         "table_name": table_name,
         "fields": fields_as_json
     };

     var tpl = _.template(file_contents);
     var migration_file_contents = tpl(template_data);
     var migration_path = 'database/migrations';

     fs.open(migration_path, 'r', function(err, fd)
     {
       if (err && err.code=='ENOENT')
       {
         throw new Error( gutil.colors.red('Migrations folder does not exist (' + migration_path + '), did you run this in the correct folder?') );
       }
     });

     fs.writeFileSync('./' + migration_path + '/' + filename, migration_file_contents);
     return true;
   },

   /**
    * Run a migration (through artisan or node emulation code)
    */
  run: function(options)
  {

  }
};

module.exports = migration;
