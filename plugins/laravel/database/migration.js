var _ = require('underscore'),
    changeCase = require('change-case'),
    moment = require('moment'),
    pluralize = require('pluralize'),
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

    // Data types for migrations
    data_types: [
            'bigIncrements',
            'bigInteger',
            'binary',
            'boolean',
            'char',
            'date',
            'dateTime',
            'decimal',
            'double',
            'enum',
            'float',
            'increments',
            'integer',
            'json',
            'jsonb',
            'longText',
            'mediumInteger',
            'mediumText',
            'morphs',
            'nullableTimestamps',
            'rememberToken',
            'smallInteger',
            'softDeletes',
            'string',
            'text',
            'time',
            'tinyInteger',
            'timestamp',
            'timestamps'
    ],

    /**
     * Match schema primative datatypes to desired database datatypes for selected data source
     */
    database_field_handling: function(table_name, parent_table_name, fields, show_field_handling, make_migrations, list_of_things)
    {
        var valid_fields = {},
            invalid_fields = {},
            natural_language_fields = {};

        if (show_field_handling == undefined)
        {
            show_field_handling = false;
        }

        for (field_name in fields)
        {
            // Trial and error data type matching
            var transformation = null;
            for (transform in changeCase)
            {
                var transformed = changeCase[transform]( fields[field_name] );
                if (migration.data_types.indexOf(transformed) > -1)
                {
                    transformation = transform;
                }
            }

            if (transformation != null)
            {
                // Got a direct match
                var data_type = changeCase[transformation]( fields[field_name] ),
                    field_name = changeCase.snakeCase(field_name);


                // Field that uses natural language, abstract to language tables
                if (data_type == 'text')
                {
                    natural_language_fields[field_name] = data_type;
                }
                else
                {
                    valid_fields[field_name] = data_type;

                    if (show_field_handling)
                    {
                        var msg = 'Got a matching data type for `' + field_name + '` with `' + data_type + '`, adding to valid fields';
                        gutil.log( gutil.colors.magenta(msg) );
                    }
                }
            }
            else
            {
                if (show_field_handling)
                {
                    var msg = 'No direct data type found, will now try to match other criteria to determine data type of `' + data_type + '`';
                    gutil.log( gutil.colors.yellow(msg) );
                }

                var estimated_class = changeCase.upperCaseFirst( changeCase.sentenceCase(fields[field_name]) );

                if (list_of_things.indexOf(estimated_class) > -1)
                {

                    // Plural? create some intermediate tables (one to many, many to many) for none matched fields
                    if (pluralize(field_name) == field_name)
                    {
                        var child_table_name = changeCase.snakeCase(fields[field_name]),
                            relationship = 'one_to_many';

                        if (make_migrations)
                        {
                            schema.make_intermediate(table_name, child_table_name, field_name, relationship);
                        }
                    }
                    else
                    {
                        // Got a reference to another thing, make a reference column
                        var field_name = changeCase.snakeCase(estimated_class) + '_id',
                            data_type = 'integer';

                        valid_fields[field_name] = data_type;
                        if (show_field_handling)
                        {
                            var msg = 'Data type was a thing, so adding reference field `' + field_name + '` with `' + data_type + '`, adding to valid fields';
                            gutil.log( gutil.colors.cyan(msg) );
                        }
                    }
                }
                else
                {
                    // Invalid field
                    invalid_fields[field_name] = fields[field_name];
                }
            }
        }

        // If we have any natural language fields, put them into a new language table
        if (Object.keys(natural_language_fields).length != 0 && make_migrations)
        {
            schema.make_language_tables(CountryLanguage.getLocales(true), table_name, natural_language_fields);
        }

        return {
            valid_fields: valid_fields,
            invalid_fields: invalid_fields
        };
    },

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
