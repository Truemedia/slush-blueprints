var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cheerio = require('gulp-cheerio'),
    rm = require('gulp-rm'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    jsonpatch = require('jsonpatch'),
    walk = require('tree-walk'),
    kvp = require('key-value-pointer'),
    _ = require('underscore'),
    CountryLanguage = require('country-language'),
    mc = require('memory-cache');

// CLI UI
var Table = require('cli-table');

// Building options
var framework = 'Laravel';
if (framework == 'Laravel')
{
  var command = require('./../plugins/laravel/app/Console/Commands/command'),
      config = require('./../plugins/laravel/config/config'),
      controller = require('./../plugins/laravel/app/Http/Controllers/controller'),
      migration = require('./../plugins/laravel/database/migrations/migration'),
      model = require('./../plugins/laravel/app/model'),
      policy = require('./../plugins/laravel/app/Policies/policy'),
      provider = require('./../plugins/laravel/app/Providers/provider'),
      request = require('./../plugins/laravel/app/Http/Requests/request'),
      routes = require('./../plugins/laravel/app/Http/routes'),
      seeder = require('./../plugins/laravel/database/seeds/seeder'),
      view = require('./../plugins/laravel/resources/views/crudl');
}

var schema =
{
    cwd: null,
    list_of_things: [],
    unorganized_things: [],
    organized_things: [],
    counters: {
        migrations: 0,
        models: 0,
    },
    settings:
    {
        traditional_logging: false, // Logging via commandline text output (no fancy UI)
    },

    // Datatypes native to schemaorg
    native_data_types: ['BooleanDate', 'DateTime', 'Number', 'Text', 'Time'],

    /* Convert a KVP match to a JSONpatch */
    convert_match_to_patch: function(thing_match, parent_match)
    {
        var thing_path = thing_match.pointer,
            thing_path = thing_path.replace('/class_name', '');

        var parent_path = parent_match.pointer,
            parent_path = parent_path.replace('class_name', 'nested_classes/');

        // TODO: Use replace instead of copy and remove once JSONpatch library is fixed
        // var json_patch = [{ "op": "move", "from": thing_path, "path": parent_path }];

        schema.organized_things = jsonpatch.apply_patch(schema.organized_things, [{ "op": "copy", "from": thing_path, "path": parent_path }]);
        var json_patch = [{ "op": "remove", "path": thing_path }];

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
                json_patch = schema.convert_match_to_patch(thing_match, parent_match);

                try
                {
                    schema.organized_things = jsonpatch.apply_patch(schema.organized_things, json_patch);
                }
                catch (PatchApplyError)
                {
                    throw new Error(PatchApplyError);
                }
            }
            else
            {
                // This is an issue with schemaorg inconsistancy, may be worth doing guess work here
                // e.g OrganizationPlace isn't a thing but Place is >:/
                gutil.log( gutil.colors.red('Parent class does not exist ' + thing['sub_class'] + ' this is an issue with schemaorg') );
            }
        }
    },

    /* Make a schema */
    make_schema: function(thing, answers)
    {
        var make_command = (answers.components.indexOf('Command') != -1),
            make_controller = (answers.components.indexOf('Controller') != -1),
            make_migration = (answers.components.indexOf('Migration') != -1),
            make_model = (answers.components.indexOf('Model') != -1),
            make_policy = (answers.components.indexOf('Policy') != -1),
            make_request = (answers.components.indexOf('Request') != -1),
            make_views = (answers.components.indexOf('View') != -1);

        var table_name = changeCase.snakeCase( thing['class_name'] ),
            parent_table_name = changeCase.snakeCase( thing['sub_class'] );

        if (schema.traditional_logging)
        {
            var msg = 'Creating migration for ' + thing['class_name'] + ' Thing, table name will be called `' + table_name + '`.';
                msg += ' Now determining field names and types';
            gutil.log( gutil.colors.magenta(msg) );
        }

        // Check which fields are native datatypes (according to laravel)
        var properties = thing['properties'],
            parent_class = thing['sub_class'],
            show_field_handling = false;

        // Avoid creating certain files when no fields exist
        if (!Object.keys(properties).length)
        {
            make_command = false,
            make_controller = false,
            make_migration = false,
            make_policy = false,
            make_request = false,
            make_views = false;
            gutil.log( gutil.colors.red(thing['class_name'] + ' has no properties, this could be an issue with the schema or the application') );
        }

        // Migrations
        var database_field_handling = migration.database_field_handling(schema.cwd, table_name, parent_table_name, properties, show_field_handling, make_migration, schema.list_of_things, answers.locales),
            table_fields = database_field_handling['valid_fields'],
            foreign_keys = database_field_handling['foreign_keys'];

        // Update foreign keys
        for (foreign_key of foreign_keys)
        {
            if (migration.foreign_keys.indexOf(foreign_key) == -1)
            {
                migration.foreign_keys.push(foreign_key);
            }
        }

        // Views
        var form_field_handling = view.form_field_handling(table_name, parent_table_name, properties, show_field_handling, schema.list_of_things),
            form_fields = form_field_handling['valid_fields'];
            form_fields = form_fields.concat(form_field_handling['natural_language_fields']);

        var mandatory_fields = [];
        mandatory_fields.push( migration.dbf('id', 'bigIncrements', 'ID') );
        if (parent_class != null)
        {
             var parent_column = migration.dbf(changeCase.snakeCase(parent_class) + '_id', 'bigInteger', parent_class + ' ID', pluralize( changeCase.snakeCase(parent_class) ));
             mandatory_fields.push(parent_column);
        }

        table_fields = mandatory_fields.concat(table_fields);

        var controller_name = changeCase.pascalCase(table_name) + 'Controller',
            model_name = changeCase.pascalCase(table_name),
            model_instance_name = '$' + changeCase.snakeCase(table_name),
            policy_name = changeCase.pascalCase(table_name) + 'Policy',
            request_name = changeCase.pascalCase(table_name) + 'Request';

        /* Go forth and make things */
        // Controllers
        if (make_controller)
        {
            if (parent_table_name != '' && schema.native_data_types.indexOf( changeCase.ucFirst(parent_table_name) ) == -1)
            {
                parent_controller_name = changeCase.pascalCase(parent_table_name) + 'Controller';
            }
            else
            {
                parent_controller_name = 'BaseController';
            }

            schema.make_controller(controller_name, parent_controller_name, model_name, request_name, answers.theme);
        }

        // Migrations
        if (make_migration && !(migration.problematic_tables.indexOf( pluralize(table_name) ) > -1))
        {
            schema.make_migration(pluralize(table_name), table_fields);
        }

        // Models
        if (make_model && !(model.problematic_models.indexOf(model_name) > -1))
        {
            schema.make_model(model_name, changeCase.pascalCase(parent_table_name), table_fields, answers.df);
        }

        // Policies
        if (make_policy)
        {
            schema.make_policy(policy_name, model_name, model_instance_name);
        }

        // Requests
        if (make_request)
        {
            schema.make_request(request_name, model_name);
        }

        // Views
        if (make_views)
        {
            schema.make_views(changeCase.pascalCase(table_name), changeCase.pascalCase(parent_table_name), form_fields, answers);
        }
    },

    /* Make all migrations stored in cache */
    make_migrations: function() {
        // Create table migrations
        for (table_name of migration.tables) {
            var db_fields = mc.get(table_name);
            if (db_fields != null) {
                console.log(table_name, 'being created');
                migration.create_table(schema.cwd, table_name, db_fields);
            }
            else {
                throw new Error('Cache not set for following table: ' + table_name);
            }
        }

        // Create migrations for foreign keys
        var processed_foreign_keys = [];
        for (foreign_key of migration.foreign_keys)
        {
            var table_name = foreign_key,
                db_fields = mc.get(table_name);

            if (db_fields != null && !(processed_foreign_keys.indexOf(table_name) > -1))
            {
                console.log(table_name, 'being modified');
                migration.add_foreign_keys(schema.cwd, table_name, db_fields);
            }
            else
            {
                // TODO: Ignore for now (can be looked at once schema is up to date)
            }
        }
    },

    /* Write command */
    make_command: function(command_name, signature, description, model_name)
    {
        command.create(schema.cwd, command_name, signature, description, model_name);
    },

    /* Make config files */
    make_configs: function()
    {
        config.copy_base_files(schema.cwd);
    },

    /* Write controller */
    make_controller: function(controller_name, parent_controller_name, model_name, request_name, layout)
    {
        controller.copy_base_files(schema.cwd);
        controller.create(schema.cwd, controller_name, parent_controller_name, model_name, request_name, layout);
    },

    /* Write kernel */
    make_kernel: function(commands)
    {
        command.copy_base_files(schema.cwd, commands);
    },

    /* Store migration in cache for later use */
    make_migration: function(table_name, database_fields)
    {
        migration.cache(table_name, database_fields);
    },

    /* Write model */
    make_model: function(model_name, parent_model_name, field_names, df)
    {
        model.copy_base_files(schema.cwd);
        // Avoid native datatype being declared as models
        if (schema.native_data_types.indexOf(parent_model_name) > -1)
        {
            parent_model_name = 'Model';
        }
        model.create(schema.cwd, model_name, parent_model_name, field_names, df);
    },

    /* Write policy */
    make_policy: function(policy_name, model_name, model_instance_name)
    {
        policy.create(schema.cwd, policy_name, model_name, model_instance_name);
    },

    /* Write request */
    make_request: function(request_name, model_name)
    {
        request.create(schema.cwd, request_name, model_name);
    },

    /* Write routes */
    make_routes: function(resources)
    {
        routes.copy_base_files(schema.list_of_things);
        routes.create(schema.cwd, resources);
    },

    /* Write seeds */
    make_seed_runner: function(seeder_classes)
    {
        seeder.copy_base_files(schema.cwd, seeder_classes);
    },

    make_seed: function(seeder_class, resource)
    {
        seeder.create(schema.cwd, seeder_class, resource);
    },

    /* Write providers */
    make_providers: function(policies)
    {
        provider.create_auth_provider(schema.cwd, policies);
    },

    /* Write views */
    make_views: function(context_name, parent_context_name, form_fields, answers)
    {
        view.copy_base_files(schema.cwd, answers.theme);
        view.create(schema.cwd, context_name, parent_context_name, form_fields, answers.df);
    }
};

module.exports = schema;
