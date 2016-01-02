var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpPlugins = require('auto-plug')('gulp'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    jsonfile = require('jsonfile');

gulp.task('schema', function(done)
{
    var cwd = path.join(__dirname, '..');

    try
    {
      var list_of_things = jsonfile.readFileSync(cwd + '/cache/list_of_things.json');
    }
    catch (e)
    {
        throw new Error('Cannot find list of things, run the install task first');
    }

    // Questions
    list_of_things.unshift('All*');
    var prompts =
    [
        {
            type: 'checkbox',
            name: 'schemas',
            message: 'Which data schemas would you like to work with for this site? (' + list_of_things.length + ' options)',
            choices: list_of_things
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
