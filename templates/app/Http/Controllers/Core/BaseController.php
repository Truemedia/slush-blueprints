<?php
namespace App\Http\Controllers\Core;

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
		$this->setupInfo($method, $class_name);
		$this->setupTitle($method, $class_name);
        $this->setupViewPath();

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
	 * Dynamically set name of view based on route name
	 *
	 * @return void
	 */
	protected function setupViewPath()
	{
		$this->view = 'pages.' . \Request::route()->getName();
	}

	/**
	 * Setup page title
	 *
	 */
	protected function setupTitle($method, $class)
	{
		$resource = ucwords( str_replace('Controller', '', class_basename($class)) );
		$this->layout->title = implode(' - ', ['CMS', $resource, $method]);
	}

	/**
	 * Setup info
	 *
	 */
	protected function setupInfo($method, $class)
	{
		$resource = ucwords( str_replace('Controller', '', class_basename($class)) );

		$this->layout->things = json_decode( file_get_contents( base_path('regeneration.json') ) );
		$this->layout->thing = $resource;
		$this->layout->thing_path = snake_case($resource);
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
				$this->layout->content->title = $this->layout->title;
			break;
		}
	}
}
