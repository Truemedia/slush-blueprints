// Core
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpPlugins = require('auto-plug')('gulp'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    CountryLanguage = require('country-language');

// Helpers
var schema = require('./../helpers/schema'),
    changeCase = require('change-case'),
    jsonfile = require('jsonfile'),
    walk = require('tree-walk');

// Configs
var defaults = require('./../config/defaults.json'),
    questions = require('./../config/questions.json');

// CLI UI
var ProgressBar = require('progress');

gulp.task('install', function(done)
{
    var prompts = [
        {
            name: 'installAgree',
            message: 'This library will create and possibly overwrite files in your Laravel instance. This may not be reversable, do you wish to continue?',
            type: 'confirm',
            default: true
        },
        questions,
                /* Not available yet */
                // {
                //     name: 'Build from specification (using regenerator.json)',
                //     value: 'specification',
                // },
                /* Not available yet */
                // {
                //     name: 'Insane (Create everything and anything possible)',
                //     value: 'insane',
                // }
        {
            name: 'components',
            message: 'What files would you like to generated based on the schemas you provided?',
            type: 'checkbox',
            choices: function()
            {
                var choices = [],
                    components = [
                        // 'Full package*',
                        // 'Assets',
                        'Configuration file',
                        'Controller',
                        // 'Command',
                        // 'Event',
                        // 'Middleware',
                        'Migration',
                        'Model',
                        'Policy',
                        // 'Provider',
                        'Request',
                        'Routes',
                        'Seed',
                        'View',
                        // 'Unit test',
                    ];

                components.forEach( function(name)
                {
                    var checked = true;
                    choices.push({name, checked});
                });

                return choices;
            }
        },
        {
            name: 'locales',
            message: 'Please select the locales your application is going to support',
            type: 'checkbox',
            choices: function()
            {
                var choices = [];
                CountryLanguage.getLocales(true).forEach(function(locale)
                {
                    var choice = {'name': locale};
                    choice.checked = (locale === defaults.locale);
                    choices.push(choice);
                });

                return choices;
            }
        },
        {
            name: 'df',
            message: 'How would you like your dates to be formatted?',
            type: 'list',
            choices: function(answers)
            {
                // TODO: Process all locales to pre-select using reliable data source of locale date formats
                var has_locale_for_df = (answers.locales.indexOf('en-GB') > -1);

                var choices = [
                    {
                        name: 'Default (Carbon)',
                        value: 'default'
                    },
                    {
                        name: 'British (en-GB)',
                        value: 'british'
                    }
                ];

                if (has_locale_for_df)
                {
                    choices.reverse();
                }

                return choices;
            }
        },
        {
            name: 'encoding',
            message: 'What file encoding would you like to use?',
            type: 'list',
            choices: function(answers)
            {
                // TODO: Populate list of all file encoding options
                var choices = [];

                choices.push({
                    name: changeCase.upperCase(defaults.encoding),
                    value: defaults.encoding
                });

                return choices;
            }
        }
    ];
    //Ask
    inquirer.prompt(prompts, function(answers)
    {
        if (answers.installAgree)
        {
            console.log('Ok, now installing');

            // TODO: Download schema if not already exists
            // var schema_download_urls = ['https://raw.githubusercontent.com/schemaorg/schemaorg/sdo-phobos/data/schema.rdfa'];
            // gulpPlugins.download(schema.download_url)
                // .pipe( gulp.dest('cache/') )
            var cwd = path.join(__dirname, '..');
            schema.cwd = cwd;

            gulp.src(cwd + '/data/schema.rdfa')
                .pipe(gulpPlugins.cheerio(function ($, file)
                {
                    // Use cache if available
                    try
                    {
                        cache_file = jsonfile.readFileSync(cwd + '/cache/unorganized_things.json');

                        // Is it a directory?
                        if (cache_file != null)
                        {
                            gutil.log( gutil.colors.cyan('Cache file found (unorganized_things.json), now processing without scraping') );
                            schema.unorganized_things = cache_file;
                        }
                        else
                        {
                            gutil.log( gutil.colors.yellow('Cache file not found, now scraping followed by processing') );
                            throw new Exception('Could not find cache file');
                        }

                        cache_file = jsonfile.readFileSync(cwd + '/cache/list_of_things.json');

                        // Is it a directory?
                        if (cache_file != null)
                        {
                            gutil.log( gutil.colors.cyan('Cache file found (list_of_things.json), now processing without scraping') );
                            schema.list_of_things = cache_file;
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

                            var thing = {
                                "class_name": class_name,
                                "sub_class": sub_class,
                                "properties": properties,
                                "nested_classes": []
                            };

                            var humanized_thing = changeCase.upperCaseFirst( changeCase.sentenceCase(thing.class_name) );

                            // Only create if not duplicate
                            // TODO: Merge multiple instances of same thing to avoid potential differences
                            if (schema.list_of_things.indexOf(humanized_thing) == -1)
                            {
                                var msg = gutil.colors.cyan('Finding things, ')
                                    + gutil.colors.green('(' + schema.unorganized_things.length + ')')
                                    + gutil.colors.yellow(' found ')
                                    + gutil.colors.magenta(humanized_thing) + '\r';
                                gutil.log(msg);

                                schema.list_of_things.push(humanized_thing);
                                schema.unorganized_things.push(thing);
                            }
                        });
                        schema.list_of_things.sort();

                        jsonfile.writeFileSync(schema.cwd + '/cache/unorganized_things.json', schema.unorganized_things, {spaces: 2});
                        gutil.log( gutil.colors.green('Unorganized things now cached! previous processes will not need to repeat next time') );
                        jsonfile.writeFileSync(schema.cwd + '/cache/list_of_things.json', schema.list_of_things, {spaces: 2});
                        gutil.log( gutil.colors.green('List of things now cached! previous processes will not need to repeat next time') );
                    }

                    gutil.log( gutil.colors.yellow('Found ' + schema.unorganized_things.length + ' things, now organizing them into a hierachy structure') );

                    // Use cache if available
                    try
                    {
                        cache_file = jsonfile.readFileSync(cwd + '/cache/organized_things.json');

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

                        jsonfile.writeFileSync(cwd + '/cache/organized_things.json', schema.organized_things, {spaces: 2});
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
                            schema.make_schema(parent, answers);
                            //progress_bar.tick();

                            if (progress_bar.complete)
                            {
                                gutil.log( gutil.colors.green('\nAll migrations created!\n') );
                            }
                        }
                    });

                    // Build files (if requested)
                    if (answers.components.indexOf('Configuration file') != -1)
                    {
                        schema.make_configs();
                    }
                    if (answers.components.indexOf('Migration') != -1)
                    {
                        schema.make_migrations();
                    }
                    if (answers.components.indexOf('Routes') != -1)
                    {
                        var resources = {};

                        for (thing of schema.list_of_things)
                        {
                            var resource = changeCase.snakeCase(thing),
                                controller = changeCase.pascalCase(thing) + 'Controller';

                            resources[resource] = controller;
                        }
                        schema.make_routes(resources);
                    }
                    if (answers.components.indexOf('Seed') != -1)
                    {
                        var seeder_classes = [];

                        for (thing of schema.list_of_things)
                        {
                            var resource = changeCase.snakeCase(thing),
                                seeder = changeCase.pascalCase(thing) + 'Seeder';

                            seeder_classes.push(seeder);
                            schema.make_seed(seeder, resource);
                        }
                        schema.make_seed_runner(seeder_classes);
                    }
                }))
                .on('end', function()
                {
                    done();
                });
        }
        else
        {
            done();
        }
    });
});
