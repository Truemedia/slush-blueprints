<?php if (isset($entries) && (is_array($entries) || $entries instanceof \Traversable) && count($entries) > 0) { ?>
    <div class="table-responsive">
        <h3>Entries found (<?php echo count($entries); ?>)</h3>
        <table class="table table-bordered table-condensed">
            <thead>
                <tr>
                    <% _.each(formFields, function(field) { %><th><%= field.label %></th>
                    <% }); %><th>Actions</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($entries as $entry) { ?>
                <tr>
                <% _.each(formFields, function(field) { %>
                    <?php if (isset($entry['<%= field.name %>'])) { ?>
                        <td><?php echo $entry['<%= field.name %>']; ?></td>
                    <?php } ?>
                <% }); %>
                    <td>
                        <a href="/<%= routeIndex %>/<?php echo $entry['id']; ?>/edit" class="btn btn-warning">Edit</a>
                        <a href="/<%= routeIndex %>/<?php echo $entry['id']; ?>" class="btn btn-danger">Delete</a>
                    </td>
                </tr>
            <?php } ?>
            </tbody>
        </table>
    </div>
<?php } else { ?>
    <h3>No entries found</h3>
<?php } ?>
