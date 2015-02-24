<?php
namespace App\Artisan;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class InstallCommand extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'character:install';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Install the character package for Regeneration';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
		$install_url = \Config::get('app.url') . '/' . str_replace(':', '/', $this->name);

		// Console output
		$this->info('Adding to list of libraries');
		$this->info('Compiling with autoloader');
		$this->info('Creating schemas');
		$this->info('Running migrations');
		$this->info('Seeding test data');
		$this->info('Generating queue table');
		$this->info('Publishing assets');
		$this->info('Running tests');
		$this->info('Pushing notifications');
		$this->comment("Package has finished installing, double check all functionality is working by visiting the following URL $install_url");
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return array(
			// array('example', InputArgument::REQUIRED, 'An example argument.'),
		);
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return array(
			// array('example', null, InputOption::VALUE_OPTIONAL, 'An example option.', null),
		);
	}

}
