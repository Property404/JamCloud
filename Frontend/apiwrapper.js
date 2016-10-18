var rel_url = "http://107.170.44.215/JamCloud/Backend/getdata.php";
function dump(obj){
	var out = '';
	for(var i in obj){
		out+= i+": "+obj[i]+"\n";
	}
	var pre = document.createElement('pre');
	pre.innerHTML = out;
	document.body.appendChild(pre);
}	

const PHP_GET_DATA = "../Backend/getdata.php"

//const OBJECT_TYPES = ["Clips", "Instruments"];
const PHP_OBJECT_COMMAND = "../Backend/objectcommand.php";
function serverUpdate(type, id, data, callback) {
    $.post(PHP_OBJECT_COMMAND,
           {"ACTION": "UPDATE",
            "CLASS": type,
            "ID": id,
            "DATA": JSON.stringify(data)},
           function(d){callback(d)}, "json");
}

function serverCreate(type, id, data, callback) {
    $.post(PHP_OBJECT_COMMAND,
           {"ACTION": "CREATE",
            "CLASS": type,
            "ID": id,
            "DATA": JSON.stringify(data)},
           function(d){callback(d);}, "json");
}

function serverDelete(type, id, callback) {
    $.post(PHP_OBJECT_COMMAND,
           {"ACTION": "DELETE",
            "CLASS": type,
            "ID": id},
           function(d){callback(d);}, "json");
}
function serverExportMIDI(name, data, callback) {
	$.post(PHP_OBJECT_COMMAND,
	{"NAME": name,
	"DATA": JSON.stringify(data)},
	function(d){callback(d);}, "json");
}
