var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue'),
    fs = require('fs-extra'),
    path = require('path');

// Queue
var fq = new FileQueue(256);

/**
 * Laravel views plugin for slush-blueprints
 * This is using CRUDL architecture with regular PHP templating
 **/
var view =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,
    layout_name: 'classic',

    // Different attributes for input type (for automatic browser UIs)
    input_types: [
        'email', 'password', 'search', 'text', 'url', 'tel', 'number', 'range', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local', 'color'
    ],

    /**
     * Match schema primative datatypes to desired HTML form field datatypes for selected data source
     */
    form_field_handling: function(context_name, parent_context_name, fields, show_field_handling, list_of_things)
    {
        var valid_fields = [],
            invalid_fields = [],
            natural_language_fields = [];

        if (show_field_handling == undefined)
        {
            show_field_handling = false;
        }

        for (field_name in fields)
        {
            // Trial and error data type matching
            var transformation = null;
            for (transform in changeCase)
            {
                var transformed = changeCase[transform]( fields[field_name] );
                if (view.input_types.indexOf(transformed) > -1)
                {
                    transformation = transform;
                }
            }

            if (transformation != null)
            {
                // Got a direct match
                var data_type = changeCase[transformation]( fields[field_name] ),
                    field_name = changeCase.snakeCase(field_name);


                // Field that uses natural language, abstract to language tables
                if (data_type == 'text')
                {
                    natural_language_fields.push({
                        name: field_name, type: data_type, label: changeCase.titleCase(field_name)
                    });
                }
                else
                {
                    valid_fields.push({
                        name: field_name, type: data_type, label: changeCase.titleCase(field_name)
                    });

                    if (show_field_handling)
                    {
                        var msg = 'Got a matching data type for `' + field_name + '` with `' + data_type + '`, adding to valid fields';
                        gutil.log( gutil.colors.magenta(msg) );
                    }
                }
            }
            else
            {
                if (show_field_handling)
                {
                    var msg = 'No direct data type found, will now try to match other criteria to determine data type of `' + data_type + '`';
                    gutil.log( gutil.colors.yellow(msg) );
                }

                var estimated_class = changeCase.upperCaseFirst( changeCase.sentenceCase(fields[field_name]) );

                if (list_of_things.indexOf(estimated_class) > -1)
                {

                    // Plural? Use a UI with multiple field instances
                    if (pluralize(field_name) == field_name)
                    {
                        var field_name = changeCase.snakeCase(fields[field_name]);
                        valid_fields.push({
                            name: field_name, type: 'select-group', label: changeCase.titleCase(field_name)
                        });
                    }
                    else
                    {
                        // Got a reference to another thing, make a dropdown
                        var field_name = changeCase.snakeCase(estimated_class) + '_id';
                        valid_fields.push({
                            name: field_name, type: 'select', label: changeCase.titleCase(field_name)
                        });
                    }
                }
                else
                {
                    // Invalid field
                    invalid_fields.push({
                        name: field_name, type: data_type, label: changeCase.titleCase(field_name)
                    });
                }
            }
        }

        // If we have any natural language fields, assign specific UI
        if (Object.keys(natural_language_fields).length != 0)
        {
            // TODO: Add language selection with text UI
        }

        return {
            valid_fields: valid_fields,
            invalid_fields: invalid_fields
        };
    },

    /* Copy base files across */
    copy_base_files: function(cwd)
    {
        if (!view.base_files_copied)
        {
            view.base_files_copied = true;
            var filename = 'template.php',
                relative_path = path.join('resources', 'views', 'layouts', view.layout_name);

            fs.copy(path.join(cwd, 'templates', relative_path, filename), path.join('.', relative_path, filename), function (error)
            {
                if (error) throw error;
                var msg = 'Base view file/s copied successfully';
                gutil.log( gutil.colors.green(msg) );
            });
        }
    },

    /**
     * Create a view based on passed parameters
     */
    create: function(cwd, context_name, parent_context_name, form_fields)
    {
        var view_files = ['_form', '_view', '_list', 'create', 'destroy', 'edit', 'index'];

       // Open view template file
       view_files.forEach( function(view_file)
       {
           var filename = view_file + '.php';
           fq.readFile(cwd + '/templates/resources/views/thing/crudl/' + filename, {encoding: 'utf8'}, function (error, file_contents)
           {
               if (error) throw error;

               var template_data = {
                   "viewFolder": changeCase.lowerCase(context_name),
                   "contextName": context_name,
                   "parentContextName": parent_context_name,
                   "formFields": form_fields,
                   "inputTypes": view.input_types
               };

               var tpl = _.template(file_contents);
               var view_file_contents = tpl(template_data);

               var view_path = 'resources/views',
                   context_path = changeCase.lowerCase(context_name);

               // Check if views folder exists (Laravel instance)
               fq.exists(view_path, function(path_exists)
               {
                   if (path_exists)
                   {
                       view_path = path.join(view_path, context_path);

                       // Create context folder if it does not exist
                       if (!fs.existsSync(view_path))
                       {
                           fs.mkdirSync(view_path);
                       }

                       // Write view file
                       fq.writeFile(path.join(view_path, filename), view_file_contents, function (err)
                       {
                           if (error) throw error;
                           view.made(filename);
                       });
                   }
                   else
                   {
                       throw new Error( gutil.colors.red('Views folder does not exist (' + view_path + '), did you run this in the correct folder?') );
                   }
               });
           });
       });
   },

   /* Callback for view being made */
   made: function(filename)
   {
       view.counter++;

       if (view.traditional_logging)
       {
           var msg = 'View file ' + filename + ' created! '
               + '(View ' + view.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = view;
