<form class="form-horizontal" action="/<%= viewFolder %>" method="POST">
    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>">
    <fieldset>
        <h2><%= contextName %></h2>
        <% _.each(formFields, function(field) { %>
        <div class="form-group">
            <label for="<%= field.name %>"><%= field.label %></label>
            <div class="controls">
                <% if (_.indexOf(inputTypes, field.type)) { %>
                <input name="<%= field.name %>" type="<%= field.type %>" placeholder="Enter <%= field.label %>" class="form-control input-xlarge">
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
