<?php if (isset($entries) && (is_array($entries) || $entries instanceof \Traversable) && count($entries) > 0) { ?>
    <div class="table-responsive">
        <h3><?php echo _("Entries found"); ?> (<?php echo count($entries); ?>)</h3>
        <table class="table table-bordered table-condensed">
            <thead>
                <tr>
                    <% _.each(formFields, function(field) { %><?php if (!empty( array_filter( array_column($entries->toArray(), '<%= field.name %>') ) )) { ?><th><?php echo _("<%= field.label %>"); ?></th><?php } ?>
                    <% }); %><th><?php echo _("Actions"); ?></th>
                </tr>
            </thead>
            <tbody>
            <?php $entries->each( function($entry, $index) use ($entries) { ?>
                <tr>
                <% _.each(formFields, function(field) { %>
                    <?php if (!empty( array_filter( array_column($entries->toArray(), '<%= field.name %>') ) )) { ?>
                    <td>
                    <?php if (isset($entry['<%= field.name %>'])) { ?>
                            <% if (_.indexOf(['date', 'dateTime'], field.type) > -1) { %>
                            <?php echo $entry['<%= field.name %>']->format(<% if (field.type == "dateTime") { %>config('formatting.df.<%= df %>.display.dateTime')<% } else if (field.type == "date") { %>config('formatting.df.<%= df %>.display.date')<% } %>); ?>
                            <% } else { %>
                            <?php echo $entry['<%= field.name %>']; ?>
                            <% } %>
                    <?php } ?>
                    </td>
                    <?php } ?>
                <% }); %>
                    <td>
                        <a href="<?php echo route('<%= routeName %>.edit', $entry->getKey()); ?>" class="btn btn-warning">
                            <?php echo _("Edit"); ?>
                        </a>
                        <a href="<?php echo route('<%= routeName %>.destroy', $entry->getKey()); ?>" class="btn btn-danger">
                            <?php echo _("Delete"); ?>
                        </a>
                    </td>
                </tr>
            <?php }); ?>
            </tbody>
        </table>
    </div>
<?php } else { ?>
    <h3><?php _("No entries found"); ?></h3>
<?php } ?>
