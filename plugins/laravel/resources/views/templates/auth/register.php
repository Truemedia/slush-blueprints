<form method="POST" action="/auth/register">
    <?php echo csrf_field(); ?>
    <div>
        Name
        <input type="text" name="name" value="<?php echo old('name'); ?>">
    </div>
    <div>
        Email
        <input type="email" name="email" value="<?php echo old('email'); ?>">
    </div>
    <div>
        Password
        <input type="password" name="password">
    </div>
    <div>
        Confirm Password
        <input type="password" name="password_confirmation">
    </div>
    <div>
        <button type="submit">Register</button>
    </div>
</form>
