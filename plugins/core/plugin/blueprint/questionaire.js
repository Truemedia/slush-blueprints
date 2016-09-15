var Rx = require('rx');

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
            },
            {
                name: 'columns',
                type: 'confirm',
                message: 'Would you like to create any columns for this migration?'
            },
            {
                name: 'columnName',
                type: 'text',
                message: 'Name of column?'
                // when: function(answers) {
                //     if (answers.columns) {
                //         prompts.push({
                //             name: 'new',
                //             type: 'text',
                //             message: 'Yup'
                //         });
                //         return true;
                //     }
                // }
            }
        ];

        return prompts;
    },

    /* Skip questions */
    skip: function(args) {
        return [];
    },

    /* Questions for creating column */
    column: function() {
        inquirer.prompt([
        {
            name: 'columnName',
            type: 'text',
            message: 'Name of column?'
        },
        {
            name: 'askAgain',
            type: 'confirm',
            message: 'Would you like to create any more columns for this migration?',
        }
        ]).then(function (answers) {
        output.push(answers.columnName);
        if (answers.askAgain) {
          questionaire.column();
        } else {
          console.log('Your favorite TV Shows:', output.join(', '));
        }
      });
    }
};

var output = [];

module.exports = questionaire;
