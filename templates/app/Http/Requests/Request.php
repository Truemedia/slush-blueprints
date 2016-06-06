<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;
use Response;

class <%= requestName %> extends Request
{
    public function rules()
    {
        return [
            // TODO: Add rules
        ];
    }

    public function authorize()
    {
        return true; // Authorization handled by policy
    }
}
