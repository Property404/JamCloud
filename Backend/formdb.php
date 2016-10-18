<html>
<body>
hey
<?php

/* This file exists to create the database tables automatically */
include_once("./session.php");

$def_layers_table = "CREATE TABLE Layers (
	ID int(11) AUTO_INCREMENT,
	IP varchar(256),
	DATA varchar(4096),
	UPDATED	int(11),
	PRIMARY KEY(ID)
	)";
$def_files_table = "CREATE TABLE Files (
	ID int(11) AUTO_INCREMENT,
	FP varchar(256),
	PRIMARY KEY(ID)
	)";


echo("ho\n<br>\n");
$result = mysqli_query($link, "SHOW TABLES LIKE 'Layers'");
echo("Checking\n<br>\n");
if($result->num_rows){
echo("Table 'Layers' exists\n<br>\n");
}else{
	echo("Table 'Layers' does not exist\n<br>\n");
	mysqli_query($link,$def_layers_table);
}


$result = mysqli_query($link, "SHOW TABLES LIKE 'Files'");
echo("Checking\n<br>\n");
if($result->num_rows){
	echo("Table 'Files' exists\n<br>\n");
}else{
	echo("Table 'Files' does not exist\n<br>\n");
	mysqli_query($link,$def_files_table);
}


?>
</body>
</html>
