<?php

namespace App\Policies;

use App\User;
use App\<%= modelName %>;

class <%= policyName %>
{
    /**
     * Determine if user can view all records
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function index(User $user)
    {
		return false;
    }

    /**
     * Determine if user can view the create page
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function create()
    {
        return false;
    }

    /**
     * Determine if user can create a record
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function store(User $user)
    {
        return false;
    }

    /**
     * Determine if user can view record
     *
     * @param  \App\User  $user
     * @param  \App\<%= modelName %>  <%= modelInstanceName %>
     * @return bool
     */
    public function show(User $user, <%= modelName %> <%= modelInstanceName %>)
    {
        return $user->id === <%= modelInstanceName %>->user_id;
    }

    /**
     * Determine if user can edit record
     *
     * @param  \App\User  $user
     * @param  \App\<%= modelName %>  <%= modelInstanceName %>
     * @return bool
     */
    public function edit(User $user, <%= modelName %> <%= modelInstanceName %>)
    {
        return $user->id === <%= modelInstanceName %>->user_id;
    }

    /**
     * Determine if user can update record
     *
     * @param  \App\User  $user
     * @param  \App\<%= modelName %>  <%= modelInstanceName %>
     * @return bool
     */
    public function update(User $user, <%= modelName %> <%= modelInstanceName %>)
    {
        return $user->id === <%= modelInstanceName %>->user_id;
    }

    /**
     * Determine if user can delete record
     *
     * @param  \App\User  $user
     * @param  \App\<%= modelName %>  <%= modelInstanceName %>
     * @return bool
     */
    public function destroy(User $user, <%= modelName %> <%= modelInstanceName %>)
    {
        return $user->id === <%= modelInstanceName %>->user_id;
    }
}
