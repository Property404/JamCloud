<?php
	include("./session.php");
	$result = mysqli_query($link, "DROP TABLE Files;");
	echo($result);
	$result = mysqli_query($link, "DROP TABLE Layers;");
	echo($result);
?>
