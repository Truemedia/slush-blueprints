<?php

use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

use App\Permission;
use App\Role;
use App\User;

class <%= seederClass %> extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /* ACL */
        // Empty tables
        // TODO: Figure out truncates
        // DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        // foreach (['users', 'role_user', 'permission_role', 'roles', 'permissions'] as $table)
        // {
        //     DB::table($table)->whereIn('name', [
        //         '<%= resourceName %>.index',
        //         '<%= resourceName %>.create',
        //         '<%= resourceName %>.store',
        //         '<%= resourceName %>.show',
        //         '<%= resourceName %>.edit',
        //         '<%= resourceName %>.update',
        //         '<%= resourceName %>.destroy'
        //     ])->delete();
        // }
		// DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $methods = ['index', 'create', 'store', 'show', 'edit', 'update', 'destory'];
        $roles = ['admin', 'audience', 'author', 'contributor', 'guest', 'manager', 'moderator', 'owner'];

        // Create permissions (create, read, update, delete, list)
        $this->command->info('Creating permissions');

        $<%= resourceName %>_perm_index = Permission::create(['name' => '<%= resourceName %>.index', 'display_name' => 'List', 'description' => 'User can view records']);
        $<%= resourceName %>_perm_create = Permission::create(['name' => '<%= resourceName %>.create', 'display_name' => 'Create', 'description' => 'User can create new record']);
        $<%= resourceName %>_perm_store = Permission::create(['name' => '<%= resourceName %>.store', 'display_name' => 'Store', 'description' => 'User can save new record']);
        $<%= resourceName %>_perm_show = Permission::create(['name' => '<%= resourceName %>.show', 'display_name' => 'Show', 'description' => 'User can view a record']);
        $<%= resourceName %>_perm_edit = Permission::create(['name' => '<%= resourceName %>.edit', 'display_name' => 'Edit', 'description' => 'User can edit a record']);
        $<%= resourceName %>_perm_update = Permission::create(['name' => '<%= resourceName %>.update', 'display_name' => 'Update', 'description' => 'User can edit a record']);
        $<%= resourceName %>_perm_destroy = Permission::create(['name' => '<%= resourceName %>.destroy', 'display_name' => 'Destroy', 'description' => 'User can delete a record']);

        // Create roles (admin, audience, author, contributor, guest, manager, moderator, owner)
        $this->command->info('Creating roles');

        // Admin can do anything with content, no exceptions
        $<%= resourceName %>_role_admin = Role::create([
            'name' => '<%= resourceName %>.admin', 'display_name' => 'Admin', 'description' => 'Admin can do anything with content, no exceptions'
        ]);
        $<%= resourceName %>_role_admin->attachPermissions([
            $<%= resourceName %>_perm_index,
            $<%= resourceName %>_perm_create,
            $<%= resourceName %>_perm_store,
            $<%= resourceName %>_perm_show,
            $<%= resourceName %>_perm_edit,
            $<%= resourceName %>_perm_update,
            $<%= resourceName %>_perm_destroy
        ]);

        // Audience can only view content that is assigned to them
        $<%= resourceName %>_role_audience = Role::create([
            'name' => '<%= resourceName %>.audience', 'display_name' => 'Audience', 'description' => 'Audience can only view content that is assigned to them'
        ]);
        $<%= resourceName %>_role_audience->attachPermissions([
            $<%= resourceName %>_perm_index, $<%= resourceName %>_perm_show
        ]);

        // Author can create and manage their own content
        $<%= resourceName %>_role_author = Role::create([
            'name' => '<%= resourceName %>.author', 'display_name' => 'Author', 'description' => 'Author can create and manage their own content'
        ]);
        $<%= resourceName %>_role_author->attachPermissions([
            $<%= resourceName %>_perm_create,
            $<%= resourceName %>_perm_store,
            $<%= resourceName %>_perm_edit,
            $<%= resourceName %>_perm_update,
            $<%= resourceName %>_perm_destroy
        ]);

        // Contributor can manage content they are assigned to, excluding delete
        $<%= resourceName %>_role_contributor = Role::create([
            'name' => '<%= resourceName %>.contributor', 'display_name' => 'Contributor', 'description' => 'Contributor can manage content they are assigned to, excluding delete'
        ]);
        $<%= resourceName %>_role_contributor->attachPermissions([
            $<%= resourceName %>_perm_edit, $<%= resourceName %>_perm_update
        ]);

        // Guest can only view publicly available content
        $<%= resourceName %>_role_guest = Role::create([
            'name' => '<%= resourceName %>.guest', 'display_name' => 'Guest', 'description' => 'Guest can only view publicly available content'
        ]);
        $<%= resourceName %>_role_guest->attachPermissions([
            $<%= resourceName %>_perm_index, $<%= resourceName %>_perm_show
        ]);

        // Manager can create, assign, and manage all content, but cannot wipe out all data
        $<%= resourceName %>_role_manager = Role::create([
            'name' => '<%= resourceName %>.manager', 'display_name' => 'Manager', 'description' => 'Manager can create, assign, and manage all content, but cannot wipe out all data'
        ]);
        $<%= resourceName %>_role_manager->attachPermissions([
            $<%= resourceName %>_perm_index,
            $<%= resourceName %>_perm_create,
            $<%= resourceName %>_perm_store,
            $<%= resourceName %>_perm_show,
            $<%= resourceName %>_perm_edit,
            $<%= resourceName %>_perm_update,
            $<%= resourceName %>_perm_destroy
        ]);

        // Moderator can delete and edit any content
        $<%= resourceName %>_role_moderator = Role::create([
            'name' => '<%= resourceName %>.moderator', 'display_name' => 'Moderator', 'description' => 'User is the owner of provided resource'
        ]);
        $<%= resourceName %>_role_moderator->attachPermissions([
            $<%= resourceName %>_perm_index, $<%= resourceName %>_perm_edit, $<%= resourceName %>_perm_update, $<%= resourceName %>_perm_destroy
        ]);

        // Owner can view all content but cannot perform any actions on the data
        $<%= resourceName %>_role_owner = Role::create([
            'name' => '<%= resourceName %>.owner', 'display_name' => 'Owner', 'description' => 'User is the owner of provided resource'
        ]);
        $<%= resourceName %>_role_owner->attachPermissions([
            $<%= resourceName %>_perm_index, $<%= resourceName %>_perm_show
        ]);

        // Create users
        $this->command->info('Creating users');

        foreach ($roles as $role_name)
        {
            $role = ${'<%= resourceName %>_role_' . $role_name};

            $faker = Faker::create();
            $user = User::create(['name' => $faker->name, 'email' => $faker->email, 'password' => Hash::make('password')]);
            $user->attachRole($role);
        }
        /* /ACL */
    }
}
