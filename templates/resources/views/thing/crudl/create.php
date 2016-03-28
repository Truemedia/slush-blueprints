<h1><?php echo $title; ?></h1>
<div class="row">
    <div class="col-md-12">
        <div class="btn-group">
            <a href="/<%= routeIndex %>" class="btn btn-default">Back to entries</a>
        </div>
    </div>
    <div class="col-md-12">
        <?php echo view('<%= viewFolder %>._form'); ?>
    </div>
</div>
