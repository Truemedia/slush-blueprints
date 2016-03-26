<?php if (isset($entries) && (is_array($entries) || $entries instanceof \Traversable) && count($entries) > 0) { ?>
    Entries found (<?php echo count($entries); ?>)
    <table>
        <thead>
            <tr>
                <% _.each(formFields, function(field) { %><th><%= field.label %></th>
                <% }); %></tr>
        </thead>
        <tbody>
        <?php foreach ($entries as $entry) { ?>
            <tr>
            <% _.each(formFields, function(field) { %>
                <?php if (isset($entry['<%= field.name %>'])) { ?>
                    <td><?php echo $entry['<%= field.name %>']; ?></td>
                <?php } ?>
            <% }); %>
            </tr>
        <?php } ?>
        </tbody>
    </table>
<?php } else { ?>
    No entries found
<?php } ?>
