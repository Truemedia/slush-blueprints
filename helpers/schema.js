var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cheerio = require('gulp-cheerio'),
    rm = require('gulp-rm'),
    fs = require('fs'),
    changeCase = require('change-case'),
    moment = require('moment'),
    jsonpatch = require('jsonpatch'),
    walk = require('tree-walk'),
    kvp = require('key-value-pointer'),
    _ = require('underscore');

// CLI UI
var Table = require('cli-table');

var schema =
{
    cwd: null,
    list_of_things: [],
    unorganized_things: [],
    organized_things: [],
    counters: {
        migrations: 0
    },
    settings:
    {
        traditional_logging: false, // Logging via commandline text output (no fancy UI)
    },
    // All primitive data types for various schema
    data_types: {
        laravel: [
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
        ]
    },

    /* Convert a KVP match to a JSONpatch */
    convert_match_to_patch: function(thing_match, parent_match, thing)
    {
        var thing_path = thing_match.pointer,
            thing_path = thing_path.replace('/class_name', '');

        var parent_path = parent_match.pointer,
            parent_path = parent_path.replace('class_name', 'nested_classes/');

        var from = thing_path,
            path = parent_path;

        var json_patch = [{ "op": "move", "from": from, "path": path, "value": thing }];
        return json_patch;
    },

    /* Organize a thing */
    organize_thing: function(thing)
    {
        var class_name = thing['class_name'],
            sub_class = thing['sub_class'];

        if (sub_class != null)
        {
            var thing_match = false,
                parent_match = false;

            var thing_match_found = kvp(schema.organized_things).query(function (node) {
                if (node.key == 'class_name' && node.value == class_name) {
                    thing_match = node;
                    return true;
                }
            });

            var parent_match_found = kvp(schema.organized_things).query(function (node) {
                if (node.key == 'class_name' && node.value == sub_class) {
                    parent_match = node;
                    return true;
                }
            });

            thing_match_found = (typeof thing_match_found == 'string');
            parent_match_found = (typeof parent_match_found == 'string');

            if (thing_match_found && parent_match_found)
            {
                // Overview
                var msg = gutil.colors.magenta(thing['class_name'])
                    + gutil.colors.yellow(' has now been added to organized tree,');
                gutil.log(msg);
                gutil.log( gutil.colors.yellow('it contains the following fields: ') );

                // Show fields as table
                var table = new Table({
                    chars: {
                        'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                        , 'right': '║' , 'right-mid': '╢' , 'middle': '│'
                    },
                    head: ['Field', 'Data type']
                });
                var properties = thing['properties'];
                for (property in properties)
                {
                    table.push([changeCase.snakeCase(property), properties[property]]);
                }

                // Alternative fields as list
                var fields = Object.keys(thing['properties']);
                fields = fields.map( function(key, value)
                {
                    return changeCase.snakeCase(value);
                });
                var field_list = fields.join(', ');
                if (field_list != '')
                {
                    gutil.log( gutil.colors.green(thing['class_name'] + ' (migration)') );
                    try
                    {
                        console.log( table.toString() );
                    }
                    catch (e)
                    {
                        console.log(field_list);
                    }
                }
                else
                {
                    gutil.log( gutil.colors.red('No fields! (could be an issue)') );
                }

                // Fit into place according to hierachy
                json_patch = schema.convert_match_to_patch(thing_match, parent_match, thing);
                schema.organized_things = jsonpatch.apply_patch(schema.organized_things, json_patch);
            }
            else
            {
                // This is an issue with schemaorg consistancy, may be worth doing guess work here
                // e.g OrganizationPlace isn't a thing but Place is >:/
                gutil.log( gutil.colors.red('Parent class does not exist ' + thing['sub_class'] + ' this is an issue with schemaorg') );
            }
        }
    },

    /* Make a migration */
    make_migration: function(thing)
    {
        var table_name = changeCase.snakeCase( thing['class_name'] );

        if (schema.traditional_logging)
        {
            var msg = 'Creating migration for ' + thing['class_name'] + ' Thing, table name will be called `' + table_name + '`.';
                msg += ' Now determining field names and types';
            gutil.log( gutil.colors.magenta(msg) );
        }

        // Check which fields are native datatypes (according to laravel)
        var properties = thing['properties'],
            show_field_handling = false
            table_fields = schema.schemaorg_to_laravel(properties, show_field_handling);

        table_fields = _.extend({'id': 'bigIncrements'}, table_fields);
        schema.laravel_make_command(table_name, table_fields);
    },

    /* Match schema primative datatypes to laravel schema datatypes */
    schemaorg_to_laravel: function(fields, show_field_handling)
    {
        var valid_fields = {};
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
                if (schema.data_types.laravel.indexOf(transformed) > -1)
                {
                    transformation = transform;
                }
            }

            if (transformation != null)
            {
                // Got a direct match
                var data_type = changeCase[transformation]( fields[field_name] ),
                    field_name = changeCase.snakeCase(field_name);

                valid_fields[field_name] = data_type;

                if (show_field_handling)
                {
                    var msg = 'Got a matching data type for `' + field_name + '` with `' + data_type + '`, adding to valid fields'; 
                    gutil.log( gutil.colors.magenta(msg) );
                }
            }
            else
            {
                if (show_field_handling)
                {
                    var msg = 'No direct data type found, will now try to match other criteria to determine data type of `' + data_type + '`';
                    gutil.log( gutil.colors.yellow(msg) );
                }

                if (schema.list_of_things.indexOf( changeCase.pascalCase(data_type) ) > -1)
                {
                    // Got a reference to another thing, make a reference column
                    var field_name = changeCase.snakeCase(data_type) + '_id',
                        data_type = 'integer';

                    valid_fields[field_name] = data_type;
                    if (show_field_handling)
                    {
                        var msg = 'Data type was a thing, so adding reference field `' + field_name + '` with `' + data_type + '`, adding to valid fields'; 
                        gutil.log( gutil.colors.cyan(msg) );
                    }
                }
            }
        }

        return valid_fields;
    },

    /* Print out command for artisan make migration or directly call API */
    laravel_make_command: function(table_name, fields_as_json, execute)
    {
        if (execute == undefined)
        {
            execute = false;
        }

        // Show command
        if (!execute)
        {
            var migration_name = 'create_' + table_name + '_table';
                table_flag = '--table=' + table_name,
                create_flag = '--create=' + table_name;

            var command = 'php artisan migration:make ' + table_flag + ' ' + create_flag;

            if (schema.traditional_logging)
            {
                gutil.log( gutil.colors.green('Use the following command to generate a migration for this table: ') );
                gutil.log( gutil.colors.green(command) );
            }
        }
        schema.laravel_make_migration(table_name, fields_as_json);
    },

    /* Write laravel migration */
    laravel_make_migration: function(table_name, fields_as_json)
    {
        var file_contents = fs.readFileSync(schema.cwd + '/templates/migration/create_table.php', {encoding: 'utf8'});

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

        fs.writeFileSync('./migrations/' + filename, migration_file_contents);
        schema.counters.migrations++;

        if (schema.traditional_logging)
        {
            var msg = 'Migration file ' + filename + ' created! '
                + '(migration ' + schema.counters.migrations + ' of ' + schema.list_of_things.length + ')';
            gutil.log( gutil.colors.green(msg) );
        }
    }
};

module.exports = schema;