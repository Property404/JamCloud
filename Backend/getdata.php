<?php

	include("./session.php");

	/* Find table to perform query on */
	if(in_array("CLASS",$_POST)){
	 	$table = $_POST["CLASS"];
		$stamp = intval($_POST["STAMP"]);
	}else{
		$table = $_GET["CLASS"];
		$stamp = intval($_GET["STAMP"]);
	}


	if($stamp != 0){
		$result = mysqli_query($link, "SELECT ID, DATA FROM $table WHERE UPDATED<$stamp");
	}else{
	$result = mysqli_query($link, "SELECT ID,DATA FROM $table");
	}
    
        echo("{\n");
        $i = 0;
        while($row = mysqli_fetch_array($result, MYSQLI_ASSOC)){
            if($i){echo(",\n");}
            $i = true;
            echo("\"".$row['ID']."\":".$row['DATA']);
        }
        echo("\n}");
?>
