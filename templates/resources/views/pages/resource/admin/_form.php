<form class="form-horizontal" action="<?php echo $form_action; ?>" method="POST">
    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
    <input type="hidden" name="_method" value="<?php echo (isset($entry) ? 'PUT' : 'POST'); ?>" />
    <fieldset>
        <h2>
            <?php echo _("<%= contextName %>"); ?>
        </h2>
        <% _.each(formFields, function(field) { %>
        <div class="form-group">
            <label for="<%= field.name %>">
                <?php echo _("<%= field.label %>"); ?>
            </label>
            <div class="controls">
                <% if (_.indexOf(inputTypes, field.type) > -1) { %>
                <input name="<%= field.name %>"
                       type="<%= field.type %>"
                       placeholder="<?php echo _("Enter <%= field.label %>"); ?>"
                       class="form-control"
                       value="<?php
                        echo (isset($entry['<%= field.name %>']) ?
                        <% if (field.type == 'dateTime' || field.type == 'date') { %>
                            $entry['<%= field.name %>']->format(<% if (field.type == "dateTime") { %>config('formatting.df.<%= df %>.entry.dateTime')<% } else if (field.type == "date") { %>config('formatting.df.<%= df %>.entry.date')<% } %>)
                        <% } else { %>
                            $entry['<%= field.name %>']
                        <% } %>
                        : ''); ?>" />
                <% } else if (_.indexOf(formElements, field.type)) { %>
                    <% if (field.type == 'select') { %>
                        <?php if (
                            isset($data_options['<%= field.table_name %>'])
                            && $data_options['<%= field.table_name %>']->count() > 0
                        ) { ?>
                            <select name="<%= field.name %>"
                                    placeholder="<?php echo _("Enter <%= field.label %>"); ?>"
                                    class="form-control">
                                <option value="">
                                    <?php echo _("Choose an option"); ?>
                                </option>
                                <?php foreach ($data_options['<%= field.table_name %>'] as $option) { ?>
                                    <option value="<?php echo $option->id; ?>"><?php echo $option->id; ?></option>
                                <?php } ?>
                            </select>
                            <a class="btn btn-success" href="<?php echo route('<%= field.route_name %>.create'); ?>">
                                <?php echo _("Add option"); ?>
                            </a>
                        <?php } else { ?>
                            <?php echo _("No options,"); ?> <a href="<?php echo route('<%= field.route_name %>.create'); ?>"><?php echo _("why not add some?"); ?></a>
                        <?php } ?>
                    <% } %>
                <% } else { %>
                <?php echo _("Unexpected UI"); ?> (<%= field.name %> = <%= field.type %>)
                <% } %>
            </div>
        </div>
        <% }); %>
        <div class="control-group">
            <button type="Submit">
                <?php echo _("Submit"); ?>
            </button>
        </div>
    </fieldset>
</form>
