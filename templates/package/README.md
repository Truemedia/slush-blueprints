# <%= vendorName %>-<%= packageName %>
<%= packageNameCaps %> package for <%= vendorName %>

== CLI commands for this package ==
1) Run the following command in the root directory of your laravel installation:
php artisan controller:make NewController --bench=<%= vendorName %>/<%= packageName %>

2) Add the following line after the first php opening tag of the newly generated file inside the packages `controller` folder
namespace <%= vendorNameCaps %>\<%= packageNameCaps %>\Controllers;

3) Run the following command in the root directory and your package directory
composer dump-autoload

=== Accessing admin area ===
Admin controller is restful, therefore has following pages available:
/<%= packageName %>/manage/ 
/<%= packageName %>/manage/create
/<%= packageName %>/manage/{lobby_id}
/<%= packageName %>/manage/{lobby_id}/edit