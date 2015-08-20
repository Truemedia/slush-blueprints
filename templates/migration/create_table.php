<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Create<%= packageNamePascalCase %>Table extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		// Create the <%= table_name %> table
		Schema::create('<%= table_name %>', function($table)
		{
			<% _.each(fields, function(val, key) { %>$table-><%= val %>('<%= key %>');
			<% }); %>
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		// Drop the <%= table_name %> table
		Schema::dropIfExists('<%= table_name %>');
	}

}