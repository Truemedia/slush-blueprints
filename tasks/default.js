var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpPlugins = require('auto-plug')('gulp'),
    _ = require('underscore.string'),
    inquirer = require('inquirer');

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