<form class="form-horizontal" action="/<%= routeIndex %><?php echo (isset($entry['id']) ? ('/' . $entry['id']) : ''); ?>" method="POST">
    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
    <input type="hidden" name="_method" value="<?php echo (isset($entry) ? 'PUT' : 'POST'); ?>" />
    <fieldset>
        <h2><%= contextName %></h2>
        <% _.each(formFields, function(field) { %>
        <div class="form-group">
            <label for="<%= field.name %>"><%= field.label %></label>
            <div class="controls">
                <% if (_.indexOf(inputTypes, field.type) > -1) { %>
                <input name="<%= field.name %>"
                       type="<%= field.type %>"
                       placeholder="Enter <%= field.label %>"
                       class="form-control"
                       value="<?php echo (isset($entry['<%= field.name %>']) ? $entry['<%= field.name %>']->format(<% if (field.type == "dateTime") { %>config('formatting.df.<%= df %>.entry.dateTime')<% } else if (field.type == "date") { %>config('formatting.df.<%= df %>.entry.date')<% } %>) : ''); ?>" />
                <% } else if (_.indexOf(formElements, field.type)) { %>
                    <% if (field.type == 'select') { %>
                        <?php if (
                            isset($data_options['<%= field.table_name %>'])
                            && $data_options['<%= field.table_name %>']->count() > 0
                        ) { ?>
                            <select name="<%= field.name %>"
                                    placeholder="Enter <%= field.label %>"
                                    class="form-control">
                                <option value="">Choose an option</option>
                                <?php foreach ($data_options['<%= field.table_name %>'] as $option) { ?>
                                    <option value="<?php echo $option->id; ?>"><?php echo $option->id; ?></option>
                                <?php } ?>
                            </select>
                            <a class="btn btn-success" href="/<%= field.table_name %>/create">Add option</a>
                        <?php } else { ?>
                            No options, <a href="/<%= field.table_name %>/create">why not add some?</a>
                        <?php } ?>
                    <% } %>
                <% } else { %>
                Unexpected UI (<%= field.name %> = <%= field.type %>)
                <% } %>
            </div>
        </div>
        <% }); %>
        <div class="control-group">
            <button type="Submit">Submit</button>
        </div>
    </fieldset>
</form>
