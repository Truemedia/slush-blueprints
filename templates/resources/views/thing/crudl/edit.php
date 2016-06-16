<h1><?php echo $title; ?></h1>
<div class="row">
    <div class="col-md-12">
        <div class="btn-group">
            <a href="<?php echo route('<%= routeName %>.index'); ?>" class="btn btn-default">
                <?php echo _("Back to entries"); ?>
            </a>
        </div>
    </div>
    <div class="col-md-12">
        <?php echo view('<%= viewFolder %>._form', compact('data_options', 'entry', 'form_action'))->render(); ?>
    </div>
</div>
