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
            }
        ];

        return prompts;
    }
};

module.exports = questionaire;
