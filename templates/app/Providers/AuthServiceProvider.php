<?php

namespace App\Providers;

use Illuminate\Contracts\Auth\Access\Gate as GateContract;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

<% _.each(policies, function(modelName, policyName) { %>use App\<%= modelName %>, App\Policies\<%= policyName %>;
<% }); %>

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
     protected $policies = [
         <% _.each(policies, function(modelName, policyName) { %><%= modelName %>::class => <%= policyName %>::class,
         <% }); %>
     ];

    /**
     * Register any application authentication / authorization services.
     *
     * @param  \Illuminate\Contracts\Auth\Access\Gate  $gate
     * @return void
     */
    public function boot(GateContract $gate)
    {
        $this->registerPolicies($gate);

        //
    }
}
