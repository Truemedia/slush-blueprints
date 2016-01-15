<?php

namespace App\Console\Commands\Regenerate;

use Illuminate\Console\Command;

use DateTime;
use ReflectionClass;

class ImportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'regenerate:import';

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

        // Loop through files per schema
        $files = glob($schema_info['files']);
        foreach ($files as $file)
        {
          $xml = simplexml_load_file($file);

          $class_namespace = 'App\\' . ucfirst( camel_case($schema) );
          $class_name = (new ReflectionClass($class_namespace))->getShortName();
          $parent_class_namespace = get_parent_class($class_namespace);
          $parent_class_name = (new ReflectionClass($parent_class_namespace))->getShortName();

          // Check if classes exist
          if (class_exists($class_namespace) && class_exists($parent_class_namespace))
          {
            $record = new $class_namespace;
            $parent_record = new $parent_class_namespace;
            $parent_attributes = $attributes = [];

            // Try allocating data
            foreach ($xml->attributes() as $attribute => $value)
            {
              if (in_array($attribute, $record->fillable))
              {
                $this->comment("$attribute is fillable for $class_name with:");
                if ($value != null && $value != '')
                {
                  $this->line($value);
                }
                else
                {
                  $this->error('NO CONTENT');
                }
                $attributes[$attribute] = $value;
              }
              elseif (in_array($attribute, $parent_record->fillable))
              {
                $this->comment("$attribute is fillable for $parent_class_name with:");
                if ($value != null && $value != '')
                {
                  $this->line($value);
                }
                else
                {
                  $this->error('NO CONTENT');
                }
                $parent_attributes[$attribute] = $value;
              }
            }

            // If data allocated, then save
            if (!empty($parent_attributes))
            {
              $parent_record->fill($parent_attributes);
              $parent_record->save();

              $parent_id = $parent_record->id;
              $attributes[strtolower($parent_class_name) . '_id'] = $parent_id;
              $parent_record_count++;
              $this->info("$parent_class_name created in Database successfully!");
            }

            if (!empty($attributes))
            {
              $record->fill($attributes);
              $record->save();
              $record_count++;
              $this->info("$class_name created in Database successfully!");
            }
          }
          else
          {
            $this->error("$class_name does not exist");
          }
        }
      }

      $end_dt = new DateTime('now');
      $time_elapsed = $start_dt->diff($end_dt);

      $this->line("$parent_class_name created in Database successfully! ($parent_record_count total)");
      $this->line("$class_name created in Database successfully! ($record_count total)");

      $this->info( $time_elapsed->format('Task complete, time elapsed: %y year/s, %m month/s, %d day/s, %h hour/s, %i minute/s, %s second/s') );

      $task_began_msg = 'Task began on the ' . $start_dt->format('jS F Y')
      . ' at ' . $start_dt->format('H:i:s');
      $task_ended_msg = 'and ended on ' . $end_dt->format('jS F Y')
      . ' at ' . $end_dt->format('H:i:s');

      $this->info($task_began_msg);
      $this->info($task_ended_msg);
    }
}
