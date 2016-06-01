<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use ReflectionClass;
use ReflectionMethod;

use App\<%= modelName %>;

class <%= controllerName %> extends <%= parentControllerName != '' ? parentControllerName : 'Controller' %>
{
    /**
     * The layout that should be used for standard HTML responses.
	 */
	protected $layout = 'layouts.<%= layoutName %>.template';

	/**
	 * Get associated data options
	 */
	private function dataOptions()
	{
		$instance = new <%= modelName %>;
		$reflector = new ReflectionClass('App\<%= modelName %>');
		$data_options = [];

		foreach ($reflector->getMethods(ReflectionMethod::IS_PUBLIC) as $method)
		{
			if (in_array($method->name . '_id', $instance->getFillable()) && $method->class == 'App\<%= modelName %>')
			{
				// Got a relationship, get the list of options
				$class = 'App\\' . ucfirst( camel_case($method->name) );
				$data_options[str_plural($method->name)] = $class::lists('id');
			}
    	}

		return $data_options;
	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
		$entries = <%= modelName %>::all();

        $this->setContent( compact('entries') );
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $data_options = static::dataOptions();

        $this->setContent( compact('data_options') );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
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

			if ($saved)
			{
				$status = 'Saved successfully!';
			}
			else
			{
				$status = 'Failed to save (unknown error occured)';
			}
		}
		else
		{
			$status = 'Validation failed';
		}

		$request->session()->flash('status', $status);
		return redirect()->action('<%= controllerName %>@index');
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
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $entry = <%= modelName %>::find($id);
		$data_options = static::dataOptions();

        $this->setContent( compact('entry', 'data_options') );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $entry = <%= modelName %>::find($id);

		$valid = true;
		if ($valid)
		{
			$updated = $entry->fill( $request->only($entry->fillable) )
							 ->save();

			if ($updated)
			{
				$status = 'Update successfully!';
			}
			else
			{
				$status = 'Failed to update (unknown error occured)';
			}
		}
		else
		{
			$status = 'Validation failed';
		}

		$request->session()->flash('status', $status);
		return redirect()->action('<%= controllerName %>@index');
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
