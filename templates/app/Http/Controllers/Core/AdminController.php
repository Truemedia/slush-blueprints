<?php

namespace App\Http\Controllers\Core;

use Schema;

use App\Http\Controllers\Core\BaseController;

class AdminController extends BaseController
{
    /**
     * The layout that should be used for standard HTML responses.
	 */
	protected $layout = 'layouts.bootstrap.template';

    public function index()
    {
        $this->setContent(['hello' => 'world']);
    }
}
