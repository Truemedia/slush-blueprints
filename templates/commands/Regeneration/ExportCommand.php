<?php

namespace App\Console\Commands\Regenerate;

use Illuminate\Console\Command;

use DateTime;
use ReflectionClass;
use SimpleXMLElement;
use SplFileInfo;

class ExportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
     protected $signature = 'regenerate:export';

     /**
      * The console command description.
      *
      * @var string
      */
      protected $description = 'Regenerate application';

     /**
      * Execute the console command.
      *
      * @return mixed
      */
      public function handle()
      {
          $start_dt = new DateTime('now');
          $this->info('Intializing seeding, this will run as a model factory');

          $schemas = ['person' => [
              'files' => public_path('1vs1000/src/Thing/Person/**/**/**/*.hbs')
          ]];

          $parent_record_count = $record_count = 0;

          // Loop through schemas
          foreach ($schemas as $schema => $schema_info)
          {
              $this->comment("Processing $schema");

              $class_namespace = 'App\\' . ucfirst( camel_case($schema) );
              $class_name = static::get_thing($class_namespace, 'class_name');
              $element_name = static::get_thing($class_namespace, 'element_name');

              $parent_class_namespace = get_parent_class($class_namespace);
              $parent_class_name = static::get_thing($parent_class_namespace, 'class_name');
              $parent_element_name = static::get_thing($parent_class_namespace, 'element_name');

              // Check if classes exist
              if (class_exists($class_namespace))
              {
                  $records = $class_namespace::with($parent_element_name)->get();
                  foreach ($records as $record)
                  {
                      $attributes = static::filter_attributes($record, $element_name, $parent_element_name);

                      $xml = static::build_xml_doc($element_name, $attributes);
                      $file_path = static::determine_file_path($attributes, $parent_class_name, $class_name);

                      // File exists, overwrite
                      if (\File::exists( public_path('1vs1000/' . $file_path) ))
                      {
                          // TODO: Add command line option to avoid overwriting if desired
                          $file_info = new SplFileInfo($file_path);
                          $file_name = $file_info->getBasename();
                          $this->comment("File exists: $file_name, now overwriting XML file!");
                          dd($xml->asXML());
                          \File::put(public_path('1vs1000/' . $file_path), $xml->asXML());
                      }
                      // File does not exist, error
                      else
                      {
                          // TODO: Add command line option to create anyway if desired
                          $this->error("File does not exist: $file_path");
                      }
                  }
                  var_dump($records);
                  die('end');
              }
              else
              {
                  $this->error("$class_name does not exist");
              }
          }
      }

      /**
       * Get thing in specific handling context
       * @param $class_namespace Class Namespaced
       * @param $context String
       * @return String
       * @author Wade Penistone
       */
      private static function get_thing($class_namespace, $context)
      {
          $thing = '';

          if (in_array($context, ['class_name', 'element_name']))
          {
              $thing = (new ReflectionClass($class_namespace))->getShortName();
          }

          if ($context == 'element_name')
          {
              $thing = strtolower($thing);
          }

          return $thing;
      }

      /**
       * Filter atttributes that are not suitable to go into XML files
       * @param $record Object Instance
       * @param $element_name String
       * @param $parent_element_name String
       * @return Array
       * @author Wade Penistone
       */
      private static function filter_attributes($record, $element_name, $parent_element_name)
      {
          $attributes = array_filter( array_merge($record->getAttributes(), $record->$parent_element_name->getAttributes()) );

          // Forbidden columns
          unset($attributes['id'], $attributes[$parent_element_name . '_id']);

          // Forbidden values
          $forbidden_values = '0000-00-00';

          foreach (array_keys($attributes, $forbidden_values, true) as $key)
          {
              unset($attributes[$key]);
          }

          // Add required attributes
          $attributes = array_merge($attributes, [
              'xmlns:xsi' => "http://www.w3.org/2001/XMLSchema-instance"
          ]);

          return $attributes;
      }

      /**
       * Build XML document based on passed element name and atttributes
       * @param $element_name String
       * @param $attributes Array
       * @return SimpleXMLElement instance
       * @author Wade Penistone
       */
      private static function build_xml_doc($element_name, $attributes)
      {
          $xml = new SimpleXMLElement("<$element_name></$element_name>");

          foreach ($attributes as $attribute => $value)
          {
              $xml->addAttribute($attribute, $value);
          }

          return $xml;
      }

      /**
       * Determine the file path of a record
       * @param $attributes Array
       * @param $class_name String
       * @param $parent_class_name String
       * @return String
       * @author Wade Penistone <wp@colewood.net>
       */
      private static function determine_file_path($attributes, $parent_class_name, $class_name)
      {
          $file_name = '';
          $file_extension = '.hbs';

          // Use name attribute
          if (isset($attributes['name']))
          {
              $file_name = $attributes['name'];
          }

          // Alter to match file pattern (lower-case alphabetic and underscore)
          $file_name = str_replace(' ', '', $file_name);
          $file_name = str_replace(',', '_', $file_name);
          $file_name = strtolower($file_name);

          // Build BEM path
          $file_path_segments = explode('_', $file_name);
          $file_path_segments[1] = '__' . $file_path_segments[1];
          $file_path_segments[2] = '_' . $file_path_segments[2];
          $file_path = implode('/', array_merge(['src', $parent_class_name, $class_name], $file_path_segments)) . '/' . implode('', $file_path_segments) . $file_extension;

          return $file_path;
      }
}
