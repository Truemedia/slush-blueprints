/*
 * slush-blueprints
 * https://github.com/Truemedia/slush-blueprints
 *
 * Copyright (c) 2015, Wade Penistone
 * Licensed under the MIT license.
 */

'use strict';

// Slush core files
var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer');

// Extras specific to this project
var gutil = require('gulp-util'),
    cheerio = require('gulp-cheerio'),
    rm = require('gulp-rm'),
    fs = require('fs'),
    changeCase = require('change-case'),
    moment = require('moment'),
    jsonpatch = require('jsonpatch'),
    jsonfile = require('jsonfile'),
    walk = require('tree-walk'),
    kvp = require('key-value-pointer'),
    // CLI UI
    Table = require('cli-table'),
    ProgressBar = require('progress');

var schema = {
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
        var file_contents = fs.readFileSync('migration_template.php', {encoding: 'utf8'});

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

        fs.writeFileSync('migrations/' + filename, migration_file_contents);
        schema.counters.migrations++;

        if (schema.traditional_logging)
        {
            var msg = 'Migration file ' + filename + ' created! '
                + '(migration ' + schema.counters.migrations + ' of ' + schema.list_of_things.length + ')';
            gutil.log( gutil.colors.green(msg) );
        }
    }
};


function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
        workingDirName = process.cwd().split('/').pop().split('\\').pop(),
        osUserName = homeDir && homeDir.split('/').pop() || 'root',
        configFile = homeDir + '/.gitconfig',
        user = {};
    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }
    return {
        vendorName: 'regeneration',
        packageName: workingDirName,
        userName: format(user.name) || osUserName,
        authorEmail: user.email || ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'vendorName',
        message: 'What project is this for, e.g vendor?',
        default: defaults.vendorName
    }, {
        name: 'packageName',
        message: 'What is the name of your package?',
        default: defaults.packageName
    }, {
        name: 'packageDescription',
        message: 'What is the description?'
    }, {
        name: 'packageVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
    }, {
        name: 'authorEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is the github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }

            // Transform user input into usable data
            var data = {
                vendorName: answers.vendorName,
                packageName: answers.packageName,
                packageDescription: answers.packageDescription,
                packageVersion: answers.packageVersion,
                authorName: answers.authorName,
                authorEmail: answers.authorEmail,
                userName: answers.userName,
                packageNameSlug: _.slugify(answers.packageName),
                packageNameCaps: _.capitalize(answers.packageName),
                vendorNameCaps: _.capitalize(answers.vendorName)
            };

            gulp.src(__dirname + '/templates/package/**')
                .pipe( template(data) )
                .pipe( rename( function(file)
                {
                    var dir = file.dirname;
                    var name = file.basename;
                    var ext = file.extname;

                    if (file.basename[0] === '_')
                    {
                        var replacements = [];

                        switch (file.basename)
                        {
                            // This is a weird file to deal with
                            case '_packageNameCapsServiceProvider':
                                replacements.push('vendorNameCaps', 'packageNameCaps'); 
                            break;

                            case '_packageNameCaps':
                                replacements.push('vendorNameCaps', 'packageNameCaps');
                            break;

                            default:
                                // Try to match file name against template variable exactly or try all the variables
                                if (data[file.basename.slice(1)] !== undefined || data[file.dirname.slice(1)] !== undefined)
                                {
                                    replacements.push(file.basename.slice(1), file.dirname.slice(1));
                                }
                                else
                                {
                                    replacements = Object.keys(data);
                                }
                            break;
                        }

                        if (replacements.length > 0)
                        {
                            replacements.forEach( function(item)
                            {
                                var find = '_' + item;
                                var replace = data[item]; 

                                dir = dir.replace(find, replace);
                                name = name.replace(find, replace);
                            });
                        }
                    }

                    file.dirname = dir;
                    file.basename = name;
                    file.ext = ext;
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function()
                {
                    done();
                });
        });
});

gulp.task('scraper', ['clear'], function()
{
    return gulp
    .src(['./data/schema.rdfa'])
    .pipe(cheerio(function ($, file)
    {
        // Use cache if available
        try
        {
            cache_file = jsonfile.readFileSync('migrations/unorganized_things.json');

            // Is it a directory?
            if (cache_file != null)
            {
                gutil.log( gutil.colors.cyan('Cache file found, now processing without scraping') );
                schema.unorganized_things = cache_file;   
            }
            else
            {
                gutil.log( gutil.colors.yellow('Cache file not found, now scraping followed by processing') );
                throw new Exception('Could not find cache file');
            }
        }
        catch (e)
        {
            // Get all the things
            $('[typeof="rdfs:Class"]').each(function()
            {
                var domain = 'http://schema.org/';
                var resource = $(this).attr('resource');

                // Get class name and parent name
                var class_name = resource.replace(domain, ''),
                    sub_class = ($(this).find('[property="rdfs:subClassOf"]').length !== 0) ? $(this).find('[property="rdfs:subClassOf"]').text() : null;
                
                // Get properties (fields)
                var properties = {};
                $('[property="' + domain + 'domainIncludes"][href="http://schema.org/' + class_name + '"]').each( function()
                {
                    var property = $(this).closest('div').attr('resource').replace(domain, ''),
                        datatype = $(this).closest('div').find('[property="' + domain + 'rangeIncludes"]').html();

                    properties[property] = datatype;
                });

                var debug_class = false;
                if (debug_class && class_name == 'CreativeWork')
                {
                    throw new Error(class_name + ' has ' + properties);
                }

                var thing = {
                    "class_name": class_name,
                    "sub_class": sub_class,
                    "properties": properties,
                    "nested_classes": []
                };

                var humanized_thing = changeCase.upperCaseFirst( changeCase.sentenceCase(thing.class_name) );
                var msg = gutil.colors.cyan('Finding things, ')
                    + gutil.colors.green('(' + schema.unorganized_things.length + ')')
                    + gutil.colors.yellow(' found ')
                    + gutil.colors.magenta(humanized_thing) + '\r';
                gutil.log(msg);

                schema.list_of_things.push(class_name);
                schema.unorganized_things.push(thing);
            });

            jsonfile.writeFileSync('migrations/unorganized_things.json', schema.unorganized_things, {spaces: 2});
            gutil.log( gutil.colors.green('Unorganized things now cached! previous processes will not need to repeat next time') );
        }

        gutil.log( gutil.colors.yellow('Found ' + schema.unorganized_things.length + ' things, now organizing them into a hierachy structure') );

        // Use cache if available
        try
        {
            cache_file = jsonfile.readFileSync('migrations/organized_things.json');

            // Is it a directory?
            if (cache_file != null)
            {
                gutil.log( gutil.colors.cyan('Cache file found (organized_things.json), now processing without building hierachy') );
                schema.organized_things = cache_file;   
            }
            else
            {
                gutil.log( gutil.colors.yellow('Cache file not found (organized_things), now building hierachy file') );
                throw new Exception('Could not find cache file');
            }
        }
        catch (e)
        {
            schema.organized_things = schema.unorganized_things;
            schema.unorganized_things.forEach( function(thing) { schema.organize_thing(thing) } );

            jsonfile.writeFileSync('migrations/organized_things.json', schema.organized_things, {spaces: 2});
            gutil.log( gutil.colors.green('Organized things now cached! previous processes will not need to repeat next time') );
        }

        // Migration creation progress bar
        var progress_bar = new ProgressBar('Creating migrations :bar :percent complete (:current/:total) created in :elapsed secs', {
            total: schema.unorganized_things.length, width: 18
        });

        // Unset to save memory
        schema.unorganized_things = undefined;

        // Walk the organized tree and build everything in the process
        walk.preorder(schema.organized_things, function(value, key, parent)
        {
            if (key == 'class_name')
            {
                schema.make_migration(parent);
                progress_bar.tick();

                if (progress_bar.complete)
                {
                    gutil.log( gutil.colors.green('\nAll migrations created!\n') );
                }
            }
        });
    }))
});

gulp.task('clear', function()
{
    return gulp.src('./migrations/*.php', { read: false })
        .pipe( rm() )
});