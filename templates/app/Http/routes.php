<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// Core controllers
Route::any('/', [
    'as' => 'admin.index',
    'uses' => 'Core\AdminController@index'
]);

// Resource controllers
<% _.each(resources, function(resource) { %>Route::resource('<%= resource.path %>', 'Resources\<%= resource.controller %>', ['names' => [
    <% _.each(resource.names, function(name) { %>'<%= name.method %>' => '<%= name.unique %>',<% }); %>
]]);
<% }); %>
