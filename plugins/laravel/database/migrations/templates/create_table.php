<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Create<%= tableClassName %>Table extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		DB::statement('SET FOREIGN_KEY_CHECKS = 0');

		<% if (_.isArray(columns) && _.size(columns) > 0) { %>// Create the <%= tableName %> table
		Schema::create('<%= tableName %>', function($table)
		{
			<% _.each(columns, function(column) {
				if (
					(!_.isUndefined(column.name) && !_.isUndefined(column.type) && !_.isUndefined(column.comment)) &&
					(column.name != null && column.type != null && column.comment != null) &&
					(column.name != '' && column.type != '' && column.comment != '')
				) { %>
				<% if (column.parent_table != null) { %>$table-><%= column.type %>('<%= column.name %>')->unsigned()->nullable()->comment('<%= column.comment %>');
				<% } else { %>$table-><%= column.type %>('<%= column.name %>')<% if (!column.flags.nn) { %>->nullable()<% } %>->comment('<%= column.comment %>');<% } %>
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

		// Drop the <%= tableName %> table
		Schema::dropIfExists('<%= tableName %>');

		DB::statement('SET FOREIGN_KEY_CHECKS = 1');
	}

}
