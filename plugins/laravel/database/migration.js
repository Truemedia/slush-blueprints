var _ = require('underscore'),
    changeCase = require('change-case'),
    moment = require('moment'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel migration plugin for slush-blueprints **/
var migration =
{
    counter: 0,
    traditional_logging: true,

  /**
   * Create a migration based on passed parameters
   */
   create: function(cwd, table_name, fields_as_json)
   {
       // Open migration template file
       fq.readFile(cwd + '/templates/migration/create_table.php', {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

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

           // Check if migrations folder exists (Laravel instance)
           fq.exists(migration_path, function(path_exists)
           {
             if (path_exists)
             {
                 // Write migration file
                 fq.writeFile('./' + migration_path + '/' + filename, migration_file_contents, function (error)
                 {
                     if (error) throw error;
                     migration.made(filename);
                 });
             }
             else
             {
               throw new Error( gutil.colors.red('Migrations folder does not exist (' + migration_path + '), did you run this in the correct folder?') );
             }
           });
       });
   },

   /* Callback for migration being made */
   made: function(filename)
   {
       migration.counter++;

       if (migration.traditional_logging)
       {
           var msg = 'Migration file ' + filename + ' created! '
               + '(Migration ' + migration.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   },

   /**
    * Run a migration (through artisan or node emulation code)
    */
  run: function(options)
  {

  }
};

module.exports = migration;
