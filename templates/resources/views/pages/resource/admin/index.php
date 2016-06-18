<h1><?php echo $title; ?></h1>
<div class="row">
    <div class="col-md-12">
        <div class="btn-group">
            <a href="<?php echo route('<%= routeName %>.create'); ?>" class="btn btn-success">
                <?php echo _("Create"); ?>
            </a>
            <a href="<?php //echo route('<%= routeName %>.destroy'); ?>" class="btn btn-danger">
                <?php echo _("Delete all"); ?>
            </a>
        </div>
    </div>
    <div class="col-md-12">
        <?php echo view('pages.<%= viewFolder %>._list', compact('entries'))->render(); ?>
    </div>
</div>
