var Rx = require('rx');

var questionaire = {
    /* Ask questions */
    ask: function(args) {
        var prompts = [
          // Put questions here
        ];

        return prompts;
    },

    /* Skip questions */
    skip: function(args) {
        return [];
    }
};

module.exports = questionaire;
