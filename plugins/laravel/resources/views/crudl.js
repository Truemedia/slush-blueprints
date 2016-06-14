var _ = require('underscore'),
    changeCase = require('change-case'),
    pluralize = require('pluralize'),
    gutil = require('gulp-util'),
    FileQueue = require('filequeue'),
    fs = require('fs-extra'),
    path = require('path');

// Queue
var fq = new FileQueue(256);

var mapper = require('./../../../../classes/mapper');

// Configs
var defaults = require('./../../../../config/defaults.json');

/**
 * Laravel views plugin for slush-blueprints
 * This is using CRUDL architecture with regular PHP templating
 **/
var view =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,
    layout_name: 'basic',

    // Different attributes for input type (for automatic browser UIs)
    input_types: [
        'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'
    ],

    // Input attributes which can be mapped directly to native datatypes (if not named in an identical manner)
    native_mappings: {
        'boolean': 'checkbox',
    },

    // HTML form elements supported by this plugin
    form_elements: [
        'input', 'select', 'select-group'
    ],

    /**
     * Compose form field
     */
    ff: function(name, type, table_name)
    {
        var form_field = {
            "name": name,
            "type": type,
            "label": changeCase.titleCase(name),
        };
        form_field.table_name = (table_name != undefined) ? table_name : null;

        return form_field;
    },

    /**
     * Match schema primative datatypes to desired HTML form field datatypes for selected data source
     */
    form_field_handling: function(context_name, parent_context_name, fields, show_field_handling, list_of_things)
    {

        var valid_fields = [], invalid_fields = [], natural_language_fields = [];

        if (show_field_handling == undefined)
        {
            show_field_handling = false;
        }

        for (field_name in fields)
        {
            // Trial and error data type matching
            var transformation = mapper.direct_datatype_transformation_match(view.input_types, fields[field_name]);

            if (transformation != null)
            {
                // Got a direct match
                var data_type = changeCase[transformation]( fields[field_name] ),
                    field_name = changeCase.snakeCase(field_name);

                // Field that uses natural language, abstract to language tables
                if (data_type == 'text')
                {
                    natural_language_fields.push( view.ff(field_name, data_type) );
                }
                else
                {
                    if (show_field_handling)
                    {
                        var msg = 'Got a direct matching data type for `' + field_name + '` with `' + data_type + '`, adding to valid fields';
                        gutil.log( gutil.colors.magenta(msg) );
                    }

                    valid_fields.push( view.ff(field_name, data_type) );
                }
            }
            else
            {
                var humanized_thing = mapper.humanized_class_transformation_match(list_of_things, fields[field_name]),
                    native_mappings = Object.keys(view.native_mappings);

                if (humanized_thing != null)
                {

                    // Plural? Use a UI with multiple field instances
                    if (pluralize(field_name) == field_name)
                    {
                        var field_name = changeCase.snakeCase(fields[field_name]);
                        valid_fields.push( view.ff(field_name, 'select-group') );
                    }
                    else
                    {
                        // Got a reference to another thing, make a dropdown
                        var table_name = pluralize( changeCase.snakeCase(humanized_thing) );
                        valid_fields.push( view.ff(field_name, 'select', table_name) );
                    }
                }
                // Got a native mapping, assign and use it
                else if (native_mappings.indexOf(changeCase.lowerCase(fields[field_name])) > -1)
                {
                    var data_type = view.native_mappings[changeCase.lowerCase(fields[field_name])];

                    if (show_field_handling)
                    {
                        var msg = 'Got an indirect mapping of data type for `' + field_name + '` with `' + data_type + '`, adding to valid fields';
                        gutil.log( gutil.colors.magenta(msg) );
                    }

                    valid_fields.push( view.ff(field_name, data_type) );
                }
                else
                {
                    // Invalid field
                    invalid_fields.push( view.ff(field_name, data_type) );
                }
            }
        }

        // If we have any natural language fields, assign specific UI
        if (Object.keys(natural_language_fields).length != 0)
        {
            // TODO: Add language selection with text UI
        }

        return {valid_fields, natural_language_fields, invalid_fields};
    },

    /* Copy base files across */
    copy_base_files: function(cwd)
    {
        if (!view.base_files_copied)
        {
            view.base_files_copied = true;
            var filename = 'template.php',
                relative_path = path.join('resources', 'views', 'layouts', view.layout_name);

            fs.copy(path.join(cwd, 'templates', relative_path), path.join('.', relative_path), function (error)
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
    create: function(cwd, context_name, parent_context_name, form_fields, df)
    {
        var view_files = ['_form', '_view', '_list', 'create', 'destroy', 'edit', 'index'];

       // Open view template file
       view_files.forEach( function(view_file)
       {
           var filename = view_file + '.php';
           fq.readFile(cwd + '/templates/resources/views/thing/crudl/' + filename, {encoding: defaults.encoding}, function (error, file_contents)
           {
               if (error) throw error;

               var template_data = {
                   "viewFolder": changeCase.lowerCase(context_name),
                   "routeName": changeCase.snakeCase(context_name),
                   "contextName": context_name,
                   "parentContextName": parent_context_name,
                   "formFields": form_fields,
                   "formElements": view.form_elements,
                   "inputTypes": view.input_types,
                   "df": df
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
