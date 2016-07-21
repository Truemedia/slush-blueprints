// Static questions
var questions = require('./../config/questions.json');

// Libs
var changeCase = require('change-case'),
    CountryLanguage = require('country-language');

var questionaire = {
    /* Ask questions */
    ask: function(settings) {
        var prompts = [
            {
                name: 'installAgree',
                message: 'This library will create and possibly overwrite files in your Laravel instance. This may not be reversable, do you wish to continue?',
                type: 'confirm',
                default: true
            },
            {
                name: 'username',
                message: 'What username would you like for the Super Admin?',
                type: 'input',
                default: settings.userName
            },
            {
                name: 'email',
                message: 'What email will be used for the Super Admin?',
                default: settings.authorEmail
            },
            questions[0],
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
                            'Command',
                            // 'Event',
                            // 'Middleware',
                            'Handler',
                            'Migration',
                            'Model',
                            'Policy',
                            'Provider',
                            'Request',
                            'Routes',
                            'Seed',
                            'View',
                            // 'Unit test',
                        ];

                    components.forEach( function(name)
                    {
                        var checked = false;
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
                        choice.checked = (locale === settings.locale);
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
                        name: changeCase.upperCase(settings.encoding),
                        value: settings.encoding
                    });

                    return choices;
                }
            },
            questions[1]
        ];

        return prompts;
    }
};

module.exports = questionaire;
