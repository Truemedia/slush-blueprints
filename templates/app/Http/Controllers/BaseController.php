<?php
namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as Controller;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BaseController extends Controller
{
	use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

	/**
	 * Wrap calls to automatically return content
	 */
	public function callAction($method, $parameters)
    {
        $this->setupLayout();

		$class_name = get_class($this);
		$this->setupTitle($method, $class_name);
        $this->setupViewPath($method, __NAMESPACE__, $class_name);

        $response = call_user_func_array([$this, $method], $parameters);

        if (is_null($response) && !is_null($this->layout))
        {
            $response = $this->layout;
        }

        return $response;
    }

	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		if (!is_null($this->layout))
		{
			$this->layout = view($this->layout);
		}
	}

	/**
	 * Dynamically set name of view based on information available from current scope
	 *
	 * @param string
	 * @param string
	 * @param

	 */
	protected function setupViewPath($method, $namespace, $class)
	{
		$namespace = explode('\\', $namespace);
		$class = explode('\\', $class);

		$package = $namespace[1];
		$controller = str_replace('Controller', '', array_pop($class));
		$view = $method;

		$path = array_map(function($string)
		{
			return strtolower($string);
		}, compact('package', 'controller', 'view'));

		$this->view = ($path['package'] != 'http' ? $path['package'] . '::' : '') . $path['controller'] . '.' . $path['view'];
	}

	/**
	 * Setup page title
	 *
	 */
	protected function setupTitle($method, $class)
	{
		$class = explode('\\', $class);
		$resource = ucwords( str_replace('Controller', '', array_pop($class)) );

		$this->layout->title = implode(' - ', ['CMS', $resource, $method]);
	}

	/**
	 * Set page content
	 *
	 * @param array
	 * @param string
	 * @return void
	 */
	protected function setContent($data, $settings = array())
	{
		// Handle request
		switch (\Request::format())
		{
			case 'json':
				return Response::json($data); // API
			break;

			default:
				if (!empty($settings) && array_key_exists('view', $settings))
				{
					$view = $settings['view'];
				}
				else
				{
					$view = $this->view;
				}

				$this->layout->content = view($view, $data); // HTML
			break;
		}
	}
}
