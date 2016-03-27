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
			<?php echo view('layouts.basic._nav'); ?>
		</header>
		<div class="container">
			<?php echo $content; ?>
		</div>
	</body>
</html>
