<form class="form-horizontal" action="/<%= viewFolder %><?php echo (isset($entry['id']) ? ('/' . $entry['id']) : ''); ?>" method="POST">
    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
    <input type="hidden" name="_method" value="<?php echo (isset($entry) ? 'PUT' : 'POST'); ?>" />
    <fieldset>
        <h2><%= contextName %></h2>
        <% _.each(formFields, function(field) { %>
        <div class="form-group">
            <label for="<%= field.name %>"><%= field.label %></label>
            <div class="controls">
                <% if (_.indexOf(inputTypes, field.type)) { %>
                <input name="<%= field.name %>"
                       type="<%= field.type %>"
                       placeholder="Enter <%= field.label %>"
                       class="form-control"
                       value="<?php echo (isset($entry['<%= field.name %>']) ? $entry['<%= field.name %>'] : ''); ?>" />
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
