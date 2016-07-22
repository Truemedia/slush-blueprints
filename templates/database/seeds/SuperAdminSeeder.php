<?php

use Illuminate\Database\Seeder;

use App\Permission;
use App\Role;
use App\User;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the Super Admin seeder
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Creating Super Admin role');

        $sa_role = Role::create([
            'name' => 'super_admin', 'display_name' => 'Super Admin', 'description' => 'Unrestricted access to site'
        ]);

        $this->command->info('Creating Super Admin user');

        $user = User::create([
            'name' => '<%= superAdmin.username %>', 'email' => '<%= superAdmin.email %>', 'password' => Hash::make('<%= superAdmin.password %>')
        ]);
        $user->attachRole($sa_role);
    }
}
