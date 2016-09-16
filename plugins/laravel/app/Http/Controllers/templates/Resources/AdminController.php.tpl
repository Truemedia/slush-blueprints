<?php

namespace App\Http\Controllers\Resources\<%= resourceName %>;

use Schema;

use App\Http\Controllers\Core\BaseController;

use ReflectionClass;
use ReflectionMethod;

use App\<%= modelName %>;
use App\Http\Requests\<%= requestName %> as Request;

class AdminController extends BaseController
{
    /**
     * The layout that should be used for standard HTML responses.
	 */
	protected $layout = 'layouts.<%= layoutName %>.template';

	protected $action_mapper = ['create' => 'store', 'edit' => 'update'];

	protected $model = 'App\<%= modelName %>';

	protected $resource = '<%= resourceName %>';

	/**
	 * Get associated data options
	 */
	private function dataOptions()
	{
		$instance = new <%= modelName %>;
		$reflector = new ReflectionClass($this->model);
		$data_options = [];

		foreach ($reflector->getMethods(ReflectionMethod::IS_PUBLIC) as $method)
		{
			if (in_array($method->name, $instance->getFillable()) && $method->class == 'App\<%= modelName %>')
			{
				// Got a relationship, get the list of options
				$class_name = get_class( $instance->{$method->name}()->getModel() );
				$class_instance = new $class_name();

				// Model has table and migration has run
				$table_name = $class_instance->getTable();
				if (!isset($data_options[str_plural($table_name)]))
				{
					if (Schema::hasTable($table_name))
					{
						$data_options[str_plural($table_name)] = $class_name::locales()->get();
					}
					// Table does not exist, and may or may not be in a migration
					else
					{
						// TODO: Decide on how this could be expanded futher
					}
				}
			}
    	}

		return $data_options;
	}

	/**
	 * Get form action (if applicable)
	 */
	private function formAction($route_name, $controller_method, $resource_id = null)
	{
		$form_action = route(
			str_replace($controller_method, $this->action_mapper[$controller_method], $route_name), $resource_id
		);
		return $form_action;
	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
		$entries = <%= modelName %>::locales()->get();

        $this->setContent( compact('entries') );
    }

    /**
     * Show the form for creating a new resource.
     *
	 * @param  \App\Http\Requests\<%= requestName %>  $request
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $data_options = static::dataOptions();
		$form_action = static::formAction($request->route()->getName(), __FUNCTION__);

        $this->setContent( compact('data_options', 'form_action') );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\<%= requestName %>  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
		$valid = true;

		if ($valid)
		{
			$instance = new <%= modelName %>();
			$saved = $instance->fill( $request->only($instance->fillable) )
							  ->save();

			list($status) = ($saved) ? ['Saved successfully!'] : ['Failed to save (unknown error occured)'];
		}
		else
		{
			$status = 'Validation failed';
		}

		return redirect()->route('<%= resourceName %>.admin.index')->with( compact('status') );
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = ['hello' => 'world'];
        $this->setContent($data);
    }

    /**
     * Show the form for editing the specified resource.
     *
	 * @param  \App\Http\Requests\<%= requestName %>  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $entry = <%= modelName %>::find($id)->locales()->first();
		$data_options = static::dataOptions();
		$form_action = static::formAction($request->route()->getName(), __FUNCTION__, $id);

        $this->setContent( compact('data_options', 'entry', 'form_action') );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\<%= requestName %>  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $entry = <%= modelName %>::find($id)->locales()->first();

		$valid = true;
		if ($valid)
		{
			$updated = $entry->fill( $request->only($entry->fillable) )
							 ->save();

			list($status) = ($updated) ? ['Update successfully!'] : ['Failed to update (unknown error occured)'];
		}
		else
		{
			$status = 'Validation failed';
		}

		return redirect()->route('<%= resourceName %>.admin.index')->with( compact('status') );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = ['hello' => 'world'];
        $this->setContent($data);
    }
}
