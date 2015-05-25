<?php namespace <%= vendorNameCaps %>\<%= packageNameCaps %>;
use Illuminate\Support\ServiceProvider;
use App\Artisan\InstallCommand;

class <%= packageNameCaps %>ServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = false;

	/**
	 * Bootstrap the application events.
	 *
	 * @return void
	 */
	public function boot()
	{
		$dir = __DIR__ . '/../../';

		$this->setupResources($dir);
	}

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		// Register commands
		$this->registerCommands();

		// List of commands
        $this->commands( array('install') );
	}

	/**
	 * Register all commands available in the package
	 *
	 * @return void
	 */
	private function registerCommands()
    {
        $this->app['install'] = $this->app->share(function($app)
        {
            return new InstallCommand;
        });
    }

    /**
     * Setup routing, configs, and views
     */
    private function setupResources($dir)
    {
		// Include routes
		include $dir . 'routes.php';

		// Set directory
		$this->loadViewsFrom($dir . 'views', '<%= packageName %>');

		// Set config
        $config = $dir . 'config' . DIRECTORY_SEPARATOR . 'app.php';
        $this->mergeConfigFrom($config, 'app');

        $this->publishes([
		    realpath($dir . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations') => $this->app->databasePath() . DIRECTORY_SEPARATOR . 'migrations',
		    realpath($dir . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'seeds') => $this->app->databasePath() . DIRECTORY_SEPARATOR . 'seeds',
		]);
    }

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array();
	}

}
