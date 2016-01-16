<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class <%= modelName %> extends <%= parentModelName != '' ? parentModelName : 'Model' %>
{
    public $timestamps = false;

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = '<%= tableName %>';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    public $fillable = [
        <% _.each(fieldNames, function(val) { %>'<%= val %>',
        <% }); %>
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['id'];

    <% if (parentTableName != '') { %>
    /**
     * Get parent class.
     */
    public function <%= parentTableName %>()
    {
        return $this->belongsTo('App\<%= parentModelName %>');
    }
    <% } %>
}
