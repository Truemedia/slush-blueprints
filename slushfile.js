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
    gutil = require('gulp-util'),
    gulpPlugins = require('auto-plug')('gulp'),
    _ = require('underscore.string'),
    inquirer = require('inquirer');

// Helpers
var schema = require('./helpers/schema'),
    changeCase = require('change-case'),
    jsonfile = require('jsonfile'),
    walk = require('tree-walk');

// CLI UI
var ProgressBar = require('progress');

function format(string)
{
    if (string == null)
    {
        string = '';
    }
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
        homeDir: homeDir,
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
                .pipe( gulpPlugins.template(data) )
                .pipe( gulpPlugins.rename( function(file)
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
                .pipe(gulpPlugins.conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(gulpPlugins.install())
                .on('end', function()
                {
                    done();
                });
        });
});

gulp.task('schema', function(done)
{
    try
    {
        schema.list_of_things = jsonfile.readFileSync(__dirname + '/cache/list_of_things.json'); 
    }
    catch (e)
    {
        throw new Error('Cannot find list of things, run the install task first');
    }
    
    // Questions
    schema.list_of_things.unshift('All*');
    var prompts =
    [
        {
            type: 'checkbox',
            name: 'schemas',
            message: 'Which data schemas would you like to work with for this site? (' + schema.list_of_things.length + ' options)',
            choices: schema.list_of_things
        },
        {
            type: 'checkbox',
            name: 'templates',
            message: 'What files would you like to generated based on the schemas you provided?',
            choices: [
              "Full package*",
              "Assets",
              "Configuration file",
              "Controller",
              "Command",
              "Event",
              "Middleware",
              "Migration",
              "Model",
              "Provider",
              "Routes",
              "Seed",
              "Theme"
            ]
        },
    ];
    
    // Answers
    inquirer.prompt(prompts, function(answers)
    {
        console.log(answers);
        done();
    });
});

gulp.task('install', function(done)
{
    var prompts = [{
        name: 'installAgree',
        message: 'Before you can generate things with this repo you must install the schema, is this ok?',
        type: 'confirm',
        default: true
    }];
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
            schema.cwd = __dirname;

            gulp.src(__dirname + '/data/schema.rdfa')
                .pipe(gulpPlugins.cheerio(function ($, file)
                {
                    // Use cache if available
                    try
                    {
                        cache_file = jsonfile.readFileSync(__dirname + '/cache/unorganized_things.json');

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

                            schema.list_of_things.push(humanized_thing);
                            schema.unorganized_things.push(thing);
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
                        cache_file = jsonfile.readFileSync(__dirname + '/cache/organized_things.json');

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

                        jsonfile.writeFileSync(__dirname + '/cache/organized_things.json', schema.organized_things, {spaces: 2});
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

gulp.task('clear', function()
{
    return gulp.src('./migrations/*.php', { read: false })
        .pipe( rm() )
});