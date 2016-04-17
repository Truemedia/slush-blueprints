var _ = require('underscore'),
    changeCase = require('change-case'),
    gutil = require('gulp-util'),
    jsonfile = require('jsonfile'),
    pluralize = require('pluralize');

/**
 * Mapper class (used for restructuring data across different formats)
 **/
var mapper =
{
    /*
     * Trial and error data type matching based on transformation that lead to direct matches
     */
    direct_datatype_transformation_match: function(valid_data_types, provided_data_type)
    {
        var transformation = null;

        for (transform in changeCase)
        {
            var transformed = changeCase[transform](provided_data_type);
            if (valid_data_types.indexOf(transformed) > -1)
            {
                transformation = transform;
            }
        }

        return transformation;
    },

    /*
     * Check if humanized class exists in array of humanized terms
     */
    humanized_class_transformation_match: function(valid_humanized_things, provided_class)
    {
        var humanized_thing = changeCase.upperCaseFirst( changeCase.sentenceCase(provided_class) );

        if (valid_humanized_things.indexOf(humanized_thing) > -1)
        {
            return humanized_thing;
        }
        else
        {
            return null;
        }
    }
};

module.exports = mapper;
