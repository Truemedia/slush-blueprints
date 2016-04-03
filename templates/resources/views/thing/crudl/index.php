<h1><?php echo $title; ?></h1>
<div class="row">
    <div class="col-md-12">
        <div class="btn-group">
            <a href="/<%= routeIndex %>/create" class="btn btn-success">Create</a>
            <a href="/<%= routeIndex %>/delete" class="btn btn-danger">Delete all</a>
        </div>
    </div>
    <div class="col-md-12">
        <?php echo view('<%= viewFolder %>._list', compact('entries'))->render(); ?>
    </div>
</div>
