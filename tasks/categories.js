var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpPlugins = require('auto-plug')('gulp'),
    path = require('path'),
    jeditor = require("gulp-json-editor"),
    walk = require('tree-walk'),
    kvp = require('key-value-pointer'),
    jsonpatch = require('jsonpatch'),
    jsonpointer = require('json-pointer'),
    mkdirp = require('mkdirp'),
    fs = require('fs');

// Use the tradedoubler API to get a free list of product categories

gulp.task('categories', function()
{
	var cwd = path.join(__dirname, '..');

    gulp.src(cwd + '/data/categories.json')
    	.pipe(jeditor(function(json)
    	{
    		var nested_data = json['categoryTrees'][0]['subCategories'];

		    // Walk the organized tree and build everything in the process
            walk.preorder(nested_data, function(value, key, parent)
            {
            	if (key == 'name')
                {
                	var category_name = value,
                		category_match = false;
						category_match_found = kvp(nested_data).query(function (node) {
		                if (node.key == 'name' && node.value == category_name) {
		                    category_match = node;
		                    return true;
		                }
		            });

					if (category_match_found)
					{
						build_path(nested_data, category_match.pointer, category_name);
					}
                }
            });
		    return json;
		  }));
});

/* Build directory path based on pointer */
function build_path(data, pointer, dir_name)
{
	var pointer_parts = pointer.split('/');
		category_indexes_recursive = [];

	// Get indexes
	for (i = 0; i < pointer_parts.length; i++)
	{
		var pointer_part = pointer_parts[i];
		var is_number =  /^\d+$/.test(pointer_part);
		if (is_number)
		{
			category_indexes_recursive.push(pointer_parts[i]);
		}
	}

	var folder_names_recursive = [],
		category_path = '/';

	// Get names using indexes (descending down)
	for (i = 0; i < category_indexes_recursive.length; i++)
	{
		if (folder_names_recursive.length > 0)
		{
			category_path = path.join(category_path, 'subCategories');
		}

		var category_index = category_indexes_recursive[i];
		category_path = path.join(category_path, category_index);

		var json_path = category_path.replace(/\\/g, '/');
		var category = jsonpointer.get(data, json_path);

		folder_names_recursive.push(category['name']);
	}
	
	// Build directory path and use to make folder
	var folder_path = folder_names_recursive.join('/');
	mkdirp(folder_path, function (err)
	{
	    if (err)
	    {
	    	console.error(err);
	    }
	    else
	    {
	    	fs.closeSync(fs.openSync(folder_path + '/.gitkeep', 'w'));
	    	gutil.log( gutil.colors.cyan('Folder ' + folder_path + ' has been created') );
	    }
	});
}