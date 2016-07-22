var _ = require('underscore'),
    changeCase = require('change-case'),
    FileQueue = require('filequeue');
    gutil = require('gulp-util'),
    moment = require('moment'),
    path = require('path'),
    pluralize = require('pluralize'),
    redis = require('redis');

// Cache
var mc = require('memory-cache');

// Queue
var fq = new FileQueue(256);

var mapper = require('./../../../../classes/mapper');

// Configs
var defaults = require('./../../../../config/defaults.json');

/**
 * Laravel seeder plugin for slush-blueprints **/
var seeder =
{
    counter: 0,
    traditional_logging: true,
    base_files_copied: false,

    /* Copy base files across */
    copy_base_files: function(cwd, seedClasses, superAdmin)
     {
         if (!seeder.base_files_copied)
         {
             seeder.base_files_copied = true;
         }
         else
         {
             return;
         }

         var filenames = ['DatabaseSeeder', 'SuperAdminSeeder'],
             ext = '.php',
             relative_path = path.join('database', 'seeds');

         // Open seeds template files
         filenames.forEach( function(filename)
         {
             var file = filename + ext;

             fq.readFile(path.join(cwd, 'templates', relative_path, file), {encoding: defaults.encoding}, function (error, file_contents)
             {
                 if (error) throw error;

                 var template_data = {};
                 switch (filename)
                 {
                     case 'DatabaseSeeder':
                        template_data = {seedClasses};
                     break;
                     case 'SuperAdminSeeder':
                        template_data = {superAdmin};
                     break;
                 }
                 var tpl = _.template(file_contents);
                 var seeder_file_contents = tpl(template_data);

                 // Check if seeds folder exists (Laravel instance)
                 fq.exists(relative_path, function(path_exists)
                 {
                     if (path_exists)
                     {
                         // Write seeder file
                         fq.writeFile(path.join('.', relative_path, file), seeder_file_contents, function (err)
                         {
                             if (error) throw error;
                             seeder.created(filename);
                         });
                     }
                     else
                     {
                         throw new Error( gutil.colors.red(`Seeds folder does not exist (${relative_path}), did you run this in the correct folder?`) );
                     }
                 });
             });
         });
     },

    /**
     * Create a seeder based on passed parameters
     */
    create: function(cwd, seederClass, resourceName)
    {
        var relative_path = path.join('database', 'seeds');

       // Open seeder template file
       fq.readFile(cwd + '/templates/database/seeds/Seeder.php', {encoding: defaults.encoding}, function (error, file_contents)
       {
           if (error) throw error;

           var filename = seederClass + '.php',
               template_data = {seederClass, resourceName};

           var tpl = _.template(file_contents);
           var seeder_file_contents = tpl(template_data);
           var seeds_path = 'database/seeds';

           // Check if seeders folder exists (Laravel instance)
           fq.exists(seeds_path, function(path_exists)
           {
             if (path_exists)
             {
                 // Write seeder file
                 fq.writeFile('./' + seeds_path + '/' + filename, seeder_file_contents, function (error)
                 {
                     if (error) throw error;
                     seeder.created(filename);
                 });
             }
             else
             {
               throw new Error( gutil.colors.red('Seeders folder does not exist (' + seeds_path + '), did you run this in the correct folder?') );
             }
           });
       });
   },

   /* Callback for seeder being made */
   created: function(filename)
   {
       seeder.counter++;

       if (seeder.traditional_logging)
       {
           var msg = 'Seeder file ' + filename + ' created! '
               + '(Seeder ' + seeder.counter + ')';
           gutil.log( gutil.colors.green(msg) );
       }
   }
};

module.exports = seeder;
