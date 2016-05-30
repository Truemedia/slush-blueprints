var _ = require('underscore'),
    changeCase = require('change-case'),
    CountryLanguage = require('country-language'),
    FileQueue = require('filequeue');
    gutil = require('gulp-util'),
    moment = require('moment'),
    pluralize = require('pluralize'),
    redis = require('redis');

// Cache
var mc = require('memory-cache');

// Queue
var fq = new FileQueue(256);

var mapper = require('./../../../classes/mapper');

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
    tables: [],
    foreign_keys: [],
    time_step: 0, // Used to offset each migration by a second

    // Used to exclude tables that might have bugs in the RDFa
    problematic_tables: ['dated_money_specification'],

    /**
     * Compose database field
     */
    dbf: function(name, type, comment, parent_table)
    {
        var database_field = {
            "name": changeCase.snakeCase(name),
            "type": type,
            "comment": changeCase.titleCase(comment),
        };
        database_field.parent_table = (parent_table != undefined) ? parent_table : null;

        return database_field;
    },

    /**
     * Format template data
     */
    ftd: function(table_name, db_fields)
    {
        return {
            "table_class_name": changeCase.pascalCase(table_name),
            "table_name": changeCase.snakeCase(table_name),
            "db_fields": db_fields
        };
    },

    /**
     * Match schema primative datatypes to desired database datatypes for selected data source
     */
    database_field_handling: function(cwd, table_name, parent_table_name, fields, show_field_handling, make_migrations, list_of_things)
    {
        var valid_fields = [], invalid_fields = [], natural_language_fields = [], foreign_keys = [];

        if (show_field_handling == undefined) { show_field_handling = false; }

        for (field_name in fields)
        {
            // Trial and error data type matching
            var transformation = mapper.direct_datatype_transformation_match(migration.data_types, fields[field_name]);

            if (transformation != null)
            {
                // Got a direct match
                var data_type = changeCase[transformation]( fields[field_name] ),
                    field_name = changeCase.snakeCase(field_name);


                // Field that uses natural language, abstract to language tables
                if (data_type == 'text')
                {
                    natural_language_fields.push( migration.dbf(field_name, data_type, 'Lang') );
                }
                else
                {
                    valid_fields.push( migration.dbf(field_name, data_type, changeCase.upperCaseFirst( changeCase.sentenceCase(field_name) )) );

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

                var humanized_thing = mapper.humanized_class_transformation_match(list_of_things, fields[field_name]);

                if (humanized_thing != null)
                {

                    // Plural? create some intermediate tables (one to many, many to many) for none matched fields
                    if (pluralize(field_name) == field_name)
                    {
                        var child_table_name = changeCase.snakeCase(fields[field_name]),
                            relationship = 'one_to_many';

                        if (make_migrations && (table_name != child_table_name))
                        {
                            migration.make_intermediate(table_name, child_table_name, field_name, relationship);
                        }
                    }
                    else
                    {
                        // Got a reference to another thing, make a reference column (with foreign key)
                        var parent_table_name = pluralize( changeCase.snakeCase(humanized_thing) ),
                            comment = humanized_thing + ' ID',
                            data_type = 'BigInteger'; // All primary keys use big integer

                        valid_fields.push( migration.dbf(field_name, data_type, comment, parent_table_name) );

                        // Only add foreign key if not already in array
                        var foreign_key = parent_table_name;
                        if (!(foreign_keys.indexOf(foreign_key) > -1))
                        {
                            foreign_keys.push(parent_table_name);
                        }

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
                    invalid_fields.push( migration.dbf(field_name, data_type, field_name) );
                }
            }
        }

        // If we have any natural language fields, put them into a new language table
        if (natural_language_fields.length != 0 && make_migrations)
        {
            migration.make_language_tables(CountryLanguage.getLocales(true), table_name, natural_language_fields);
        }

        return {
            valid_fields: valid_fields,
            invalid_fields: invalid_fields,
            foreign_keys: foreign_keys
        };
    },

    /* Make intermediates for provided table names (if possible) */
    make_intermediate: function(parent_table_name, child_table_name, attribute_name, relationship)
    {
        var fields = [];
            table_name = parent_table_name + '_' + attribute_name;

        var parent_field = migration.dbf(parent_table_name + '_id', 'BigInteger', parent_table_name + ' ID', parent_table_name);
            child_field = migration.dbf(child_table_name + '_id', 'BigInteger', child_table_name + ' ID');

        // Cache migration so that it can be built later
        fields.push(parent_field, child_field);
        migration.cache(table_name, fields);
    },

    /* Make language tables for provided table name (if possible) */
    make_language_tables: function(locales, parent_table_name, language_fields)
    {
        mandatory_fields = [];
        mandatory_fields.push( migration.dbf('parent_id', 'bigIncrements', parent_table_name + ' ID', parent_table_name) );

        for (locale in locales)
        {
            var fields = mandatory_fields.concat(language_fields);
                language_table_name = parent_table_name + '_' + locales[locale];

            // Cache migration so that it can be built later
            migration.cache(language_table_name, fields);
        }
    },

    /**
     * Cache migration data so it can be deployed to a file at a later point
     */
    cache: function(table_name, database_fields) {
        mc.put(table_name, database_fields);
        migration.tables.push(table_name);
    },

    /**
     * Create a table migration based on passed parameters
     */
    create_table: function(cwd, table_name, db_fields)
    {
       // Open migration template file
       fq.readFile(cwd + '/templates/migration/create_table.php', {encoding: 'utf8'}, function (error, file_contents)
       {
           if (error) throw error;

           migration.time_step++;

           var filename = moment().startOf('day').add(migration.time_step, 'second').format('YYYY_MM_DD_HHmmss') + '_create_' + table_name + '_table.php',
               tpl = _.template(file_contents),
               migration_file_contents = tpl( migration.ftd(table_name, db_fields) ),
               migration_path = 'database/migrations';

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

   /**
    * Add foreign keys migration based on passed parameters
    */
   add_foreign_keys: function(cwd, table_name, db_fields)
   {
      // Open migration template file
      fq.readFile(cwd + '/templates/migration/add_foreign_keys.php', {encoding: 'utf8'}, function (error, file_contents)
      {
          if (error) throw error;

          migration.time_step++;

          var filename = moment().startOf('day').add(migration.time_step, 'second').format('YYYY_MM_DD_HHmmss') + '_add_foreign_keys_to_' + table_name + '_table.php',
              tpl = _.template(file_contents),
              migration_file_contents = tpl( migration.ftd(table_name, db_fields) ),
              migration_path = 'database/migrations';

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
