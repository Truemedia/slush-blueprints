<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Schema;

class <%= modelName %> extends <%= parentModelName != null ? parentModelName : 'Model' %>
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
        <% _.each(attributes, function(attribute) { %><% if (attribute.name != 'id') { %>'<%= attribute.name %>',<% } %>
        <% }); %>
    ];

    /**
     * Date fields (can be cast using Carbon)
     *
     * @var array
     */
    protected $dates = [
        <% _.each(attributes, function(attribute) { %><% if (_.indexOf(['date', 'dateTime'], attribute.type) > -1) { %>'<%= attribute.name %>',<% } %>
        <% }); %>
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'id'
    ];

    /**
     * Mutators
     *
     */
     <% _.each(attributes, function(attribute) { %><% if (_.indexOf(['date', 'dateTime'], attribute.type) > -1) { %>
    public function set<%= attribute.functionName %>Attribute($value)
    {
        $this->attributes['<%= attribute.name %>'] = Carbon::createFromFormat(config('formatting.df.<%= df %>.entry.date'), $value);
    }
    <% } %><% }); %>

    <% if (parentTableName != null) { %>
    /**
     * Get parent class.
     */
    public function <%= parentTableName %>() { return $this->belongsTo('App\<%= parentModelName %>'); }
    <% } %>

    /**
     * Get child classes
     */
     <% _.each(things, function(thing) { %>public function <%= thing.functionName %>() { return $this->hasOne('App\<%= thing.modelName %>'); }
     <% }); %>

     /**
      * Translation function
      *
      * @param $locale String
      * @return \Illuminate\Database\Eloquent\Builder
      */
     public function scopeLocales($query, $locale = null)
     {
         // TODO: Respect model attributes
         if ($locale == null)
         {
             $locale = \App::getLocale();
         }

         $lang_table = $this->getTable() . '_' . str_replace('-', '_', strtolower($locale));
         if (Schema::hasTable($lang_table))
         {
             $query->select($this->getTable() . '.*');
             foreach (\Schema::getColumnListing($lang_table) as $column_name)
             {
                 if ($column_name != 'id' && $column_name != 'parent_id')
                 {
                     $query->addSelect($lang_table . '.' . $column_name);
                 }
             }
             $query->leftJoin($lang_table, $this->getTable() . '.' . 'id', '=', $lang_table . '.' . 'parent_id');
         }

         return $query;
     }
}
