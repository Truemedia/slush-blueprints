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
    ff: function(name, type, route_name, table_name)
    {
        var form_field = {
            "name": name,
            "type": type,
            "label": changeCase.titleCase(name),
        };
        form_field.route_name = (route_name != undefined) ? route_name : null;
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
                        var route_name = changeCase.snakeCase(humanized_thing) + '.admin',
                            table_name = pluralize( changeCase.snakeCase(humanized_thing) );

                        valid_fields.push( view.ff(field_name, 'select', route_name, table_name) );
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
    copy_base_files: function(cwd, layout_name)
    {
        if (!view.base_files_copied)
        {
            view.base_files_copied = true;
            var view_path =  path.join('resources', 'views'),
                layout_path = path.join(view_path, 'layouts', layout_name),
                pages_path = path.join(view_path, 'pages');

            // Layout
            fs.copy(path.join(cwd, 'templates', layout_path), path.join('.', layout_path), function (error)
            {
                if (error) throw error;
                var msg = 'Layout file/s copied successfully';
                gutil.log( gutil.colors.green(msg) );
            });

            // Core pages
            fs.copy(path.join(cwd, 'templates', pages_path, 'admin'), path.join('.', pages_path, 'admin'), function (error)
            {
                if (error) throw error;
                var msg = 'Core page file/s copied successfully';
                gutil.log( gutil.colors.green(msg) );
            });
        }
    },

    /**
     * Create a view based on passed parameters
     */
    create: function(cwd, contextName, parentContextName, formFields, df)
    {
        var view_files = ['_form', '_view', '_list', 'create', 'destroy', 'edit', 'index'],
            relative_path = path.join('resources', 'views');

       // Open view template file
       view_files.forEach( function(view_file)
       {
           var filename = view_file + '.php';
           fq.readFile(path.join(cwd, 'templates', relative_path, 'pages', 'resource', 'admin', filename), {encoding: defaults.encoding}, function (error, file_contents)
           {
               if (error) throw error;

               var viewFolder = routeName = changeCase.snakeCase(contextName) + '.admin',
                   formElements = view.form_elements,
                   inputTypes = view.input_types;

               var template_data = {viewFolder, routeName, contextName, parentContextName, formFields, formElements, inputTypes, df};

               var tpl = _.template(file_contents);
               var view_file_contents = tpl(template_data);

               // Check if views folder exists (Laravel instance)
               fq.exists(path.join('.', relative_path), function(path_exists)
               {
                   if (path_exists)
                   {
                       var pages_path = path.join('.', relative_path, 'pages'),
                           view_path = path.join(pages_path, changeCase.snakeCase(contextName)),
                           admin_path = path.join(view_path, 'admin');

                       // Create pages folder if it does not exist
                       if (!fs.existsSync(pages_path))
                       {
                           fs.mkdirSync(pages_path);
                       }

                       // Create context folder if it does not exist
                       if (!fs.existsSync(view_path))
                       {
                           fs.mkdirSync(view_path);
                       }

                       // Create admin folder if it does not exist
                       if (!fs.existsSync(admin_path))
                       {
                           fs.mkdirSync(admin_path);
                       }

                       // Write view file
                       fq.writeFile(path.join(admin_path, filename), view_file_contents, function (err)
                       {
                           if (error) throw error;
                           view.made(filename);
                       });
                   }
                   else
                   {
                       throw new Error( gutil.colors.red('Views folder does not exist (' + relative_path + '), did you run this in the correct folder?') );
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
