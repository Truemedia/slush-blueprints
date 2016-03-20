<form class="form-horizontal" action="/" method="POST">
    <fieldset>
        <h2><%= contextName %></h2>
        <% _.each(formFields, function(field) { %>
        <div class="control-group">
            <label class="control-label" for="<%= field.name %>"><%= field.label %></label>
            <div class="controls">
                <% if (_.indexOf(inputTypes, field.type)) { %>
                <input name="<%= field.name %>" type="<%= field.type %>" placeholder="Enter <%= field.label %>" class="input-xlarge">
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
