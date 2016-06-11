<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Create<%= table_class_name %>Table extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		DB::statement('SET FOREIGN_KEY_CHECKS = 0');

		<% if (_.isArray(db_fields) && _.size(db_fields) > 0) { %>// Create the <%= table_name %> table
		Schema::create('<%= table_name %>', function($table)
		{
			<% _.each(db_fields, function(db_field) {
				if (
					(!_.isUndefined(db_field.name) && !_.isUndefined(db_field.type) && !_.isUndefined(db_field.comment)) &&
					(db_field.name != null && db_field.type != null && db_field.comment != null) &&
					(db_field.name != '' && db_field.type != '' && db_field.comment != '')
				) { %>
				<% if (db_field.parent_table != null) { %>$table-><%= db_field.type %>('<%= db_field.name %>')->unsigned()->nullable()->comment('<%= db_field.comment %>');
				<% } else { %>$table-><%= db_field.type %>('<%= db_field.name %>')<% if (db_field.nullable) { %>->nullable()<% } %>->comment('<%= db_field.comment %>');<% } %>
			<% }
			}); %>
		});<% } %>

		DB::statement('SET FOREIGN_KEY_CHECKS = 1');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		DB::statement('SET FOREIGN_KEY_CHECKS = 0');

		// Drop the <%= table_name %> table
		Schema::dropIfExists('<%= table_name %>');

		DB::statement('SET FOREIGN_KEY_CHECKS = 1');
	}

}
