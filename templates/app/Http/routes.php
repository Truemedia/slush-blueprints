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

// Authentication routes
Route::group(['prefix' => 'auth'], function() {
    Route::get('login', ['as' => 'auth.login.get', 'uses' => 'Auth\AuthController@getLogin']);
    Route::post('login', ['as' => 'auth.login.post', 'uses' => 'Auth\AuthController@postLogin']);
    Route::get('logout', ['as' => 'auth.logout', 'uses' => 'Auth\AuthController@getLogout']);
    Route::get('register', ['as' => 'auth.register.get', 'uses' => 'Auth\AuthController@getRegister']);
    Route::post('register', ['as' => 'auth.register.post', 'uses' => 'Auth\AuthController@postRegister']);
});

// Resource controllers (admin)
Route::group(['prefix' => 'admin', 'middleware' => 'auth'], function() {
    Route::any('/', ['as' => 'admin.index', 'uses' => 'Core\AdminController@index']);

    <% _.each(resources, function(resource) { %>Route::resource('<%= resource.path %>', 'Resources\<%= resource.name %>\AdminController', ['names' => [
        <% _.each(resource.names, function(name) { %>'<%= name.method %>' => '<%= name.unique %>',<% }); %>
    ]]);
    <% }); %>
});
