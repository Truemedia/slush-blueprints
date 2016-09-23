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
      DB::statement('SET FOREIGN_KEY_CHECKS = 0');

  		<% if (_.isArray(columns) && _.size(columns) > 0) { %>// Seed the <%= tableName %> table
  		DB::table('<%= tableName %>')->insert([
  		{
  			<% _.each(columns, function(column) {
  				if (
  					(!_.isUndefined(column.name) && !_.isUndefined(column.type) && !_.isUndefined(column.comment)) &&
  					(column.name != null && column.type != null && column.comment != null) &&
  					(column.name != '' && column.type != '' && column.comment != '')
  				) { %>
  				'<%= column.name %>' => 'test',
  			<% }
  			}); %>
  		]);<% } %>

  		DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
