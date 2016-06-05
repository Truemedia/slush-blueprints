<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Schema;

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
        <% _.each(fields, function(field) { %>'<%= field.name %>',
        <% }); %>
    ];

    /**
     * Date fields (can be cast using Carbon)
     *
     * @var array
     */
    protected $dates = [
        <% _.each(fields, function(field) { %><% if (_.indexOf(['date', 'dateTime'], field.type) > -1) { %>'<%= field.name %>',<% } %>
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
    public function <%= parentTableName %>() { return $this->belongsTo('App\<%= parentModelName %>'); }
    <% } %>

    /**
     * Get child classes
     */
     <% _.each(things, function(thing) { %>public function <%= thing.propertyFunctionName %>() { return $this->hasOne('App\<%= thing.modelName %>'); }
     <% }); %>

     /**
      * Translation function
      *
      * @param $locale String
      * @return \Illuminate\Database\Eloquent\Builder
      */
     public function scopeLocales($query, $locale = null)
     {
         if ($locale == null)
         {
             $locale = \App::getLocale();
         }

         $lang_table = $this->getTable() . '_' . str_replace('-', '_', strtolower($locale));
         if (Schema::hasTable($lang_table))
         {
             $query->leftJoin($lang_table, $this->getTable() . '.' . 'id', '=', $lang_table . '.' . 'parent_id');
         }

         return $query;
     }
}
