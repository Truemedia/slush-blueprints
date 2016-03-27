<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\<%= modelName %>;

class <%= controllerName %> extends <%= parentControllerName != '' ? parentControllerName : 'Controller' %>
{
    /**
     * The layout that should be used for standard HTML responses.
	 */
	protected $layout = 'layouts.<%= layoutName %>.template';

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
        $data = ['hello' => 'world'];
        $this->setContent($data);
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
        $data = ['hello' => 'world'];
        $this->setContent($data);
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
        $data = ['hello' => 'world'];
        $this->setContent($data);
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
