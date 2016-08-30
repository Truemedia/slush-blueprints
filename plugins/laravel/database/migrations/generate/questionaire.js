var questionaire = {
    /* Ask questions */
    ask: function(args) {
        var prompts = [
            {
                name: 'installAgree',
                type: 'confirm',
                message: 'This library will create and possibly overwrite files in your Laravel instance. This may not be reversable, do you wish to continue?',
                default: true
            },
            {
                name: 'table',
                type: 'text',
                message: 'Name of table?'
            }
        ];

        return prompts;
    },

    /* Skip questions */
    skip: function(args) {
        return [];
    }
};

module.exports = questionaire;
