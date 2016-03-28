<!DOCTYPE html>
	<head>
		<title><?php echo $title; ?></title>
		<!-- Assets -->
		<link rel="stylesheet" href="/css/app.css" />
		<script type="text/javascript" src="/js/app.js"></script>
		<!-- Browser settings -->
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body id="layout">
		<header>
			<?php echo view('layouts.basic._nav', compact('things', 'thing', 'thing_path')); ?>
		</header>
		<div class="panel panel-primary" style="margin: 0 20px;">
			<div class="panel-heading">
				<h3 class="panel-title">All things (<?php echo count($things); ?>)</h3>
				<br />
				<button data-toggle="collapse" data-target="#all_things" class="btn btn-default">Show/Hide</button>
			</div>
  			<div id="all_things" class="panel-body collapse">
			<?php foreach ($things as $thing) { ?>
				<a href="/<?php echo snake_case( str_replace(' ', '', ucwords($thing)) ); ?>"><?php echo $thing; ?></a> &nbsp;
			<?php } ?>
  			</div>
		</div>
		<div class="container">
			<?php echo $content; ?>
		</div>
	</body>
</html>
