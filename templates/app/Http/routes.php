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

// Resource controllers (admin)
Route::group(['prefix' => 'admin'], function () {
    Route::any('/', ['as' => 'admin.index', 'uses' => 'Core\AdminController@index']);

    <% _.each(resources, function(resource) { %>Route::resource('<%= resource.path %>', 'Resources\<%= resource.name %>\AdminController', ['names' => [
        <% _.each(resource.names, function(name) { %>'<%= name.method %>' => '<%= name.unique %>',<% }); %>
    ]]);
    <% }); %>
});
