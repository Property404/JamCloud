var layers = {} /* Layer dictionary */

const DEFAULT_DURATION = 2;
const POLL_FREQUENCY = 1; // every 1 second
var time_scale = 100; // 100 px / second
// future: px/beats
function logServerResponse(d) {
    console.log(d);
    return d;
}

function addLayer(name = null) {
    id = 0;
    /* Get random id */
    while (id in layers) {
        id = getRandomInt(0, 255);
    }
    if (name == null) {
        name = id.toString();
    }
    layers[id].push(Layer(name));
}

$(function() {
    console.log("Loading...");
    var loaded_objects = [false];
    $.get("../Backend/getdata.php?CLASS=Layers",
        null,
        function(result, status) {
            if (status == "success") {
                layers = JSON.parse(result);
                loaded_objects[0] = true;
                allLoaded(loaded_objects);
                return;
            }
            // error occurred
            console.error(data + ": Error occurred, didn't load data. :(");
        });

    function allLoaded(loaded_objects) {
        if (!(false in loaded_objects)) {
            console.log("Building tabl...");
            buildTable();
            console.log("Successfully loaded the data");
        }
    }
    // add 1-time event listeners
    $("#content").click(checkForAdd);

    pollUpdates();
});

function buildTable() {
    // Empty the table of any instruments
    $("#content > :not(.persistant)").remove();

    // go through and manifest the layers
    for (var key in layers) {
        console.log(layers[key].clips);
        manifestLayer(key, layers[key]);
        /* manifest clips */
        for (var i = 0; i < layers[key].clips.length; i++) {
            manifestClip(key, layers[key].clips[i]);
        }
    }


    // add event listeners
    $(".clip").mousedown(startDragClip);
    $('#playButton').click(playAll);
    $('#stopButton').click(stopAll);
    $('#newLayer').click(createLayer);
    xbutts = document.getElementsByClassName("layerRemoveButton");
    for (var i = 0; i < xbutts.length; i++) {
        xbutts[i].addEventListener('click', deleteLayerSelfishly, false);
    }
    $('.clip').dblclick(editClip);


}

// Plays the whole piece. Initiates all sound and moves the timer bar.
function playAll() {

    //Concatenate like instrument sounds together

    var allnotes = [{
        note: 'E5',
        time: 0,
        duration: 3
    }];
    for (var j = 0; j < data.clips.length; j++) {
        allnotes = allnotes.concat(data.clips[j].data.contents);
    }
    // Play each instrument separately all as a single instrument call
    playNoteSeries("acoustic_grand_piano", allnotes);
    stepTimerBar();
}

function stepTimerBar() {
    //var increment = ($('#bpm').val) * ($('.clipTimeline').css('width')/60);
    $('#timerBar').css('left', '200px');
    $('#timerBar').velocity({
        left: $('.clipTimeline').css('width')
    }, {
        duration: ($('#bpm').val()) * 60000 / 60
    });


    console.log(($('#bpm').val()) * 100000 / 60);
}


function stopAll() {
    //"acoustic_grand_piano"
    $('#timerBar').velocity('finish');
    $('#timerBar').css('left', '200px');
}


function manifestLayer(layer_id, layer) {
    console.log("Manifesting Layer " + layer_id + "!");
    // Make a copy of the template
    var template = $("#layerTemplate").get(0).cloneNode(true);
    console.log(template);
    template.id = "layer_" + layer_id;
    var $temp = $(template);
    // edit the template values
    $temp.removeClass("persistant").removeClass("hidden");
    $temp.find(".layerSettings > .text").text(
        layer.name);

    //$temp.find(".layerRemove > .data").data(layer_id);

    // add the newly-filled template to the list
    $temp.insertBefore("#layerAdd");
}

function createLayer() {
    /* Create blank layer */
    var layer = new Layer("Untitled");

    /* Get Layer name */
    layer.name = window.prompt("Layer name", layer.name);

    /* Get random id */
    id = 0
    while (id in layers) {
        id = getRandomInt(0, 255);
    }

    /* Add to client */
    layers[id] = layer;

    /* Add to server */
    serverCreate("Layers", id, layer, logServerResponse);

    /* Rebuild table */
    buildTable();
}

//doesnt work
function deleteLayerSelfishly(event) {
    console.log("DELETEING");
    layer_id_str = event.target.parentNode.parentNode.id;
    layer_id = parseInt(layer_id_str.substr(6))
    delete layers[layer_id];
    buildTable();

}

function manifestClip(layer_id, clip) {
    // copy the template
    var template = $("#clipTemplate").get(0).cloneNode(true);
    template.id = "clip_" + clip.id;
    var $clipElem = $(template);

    // edit the template values
    $clipElem.removeClass("persistant").removeClass("hidden");
    $clipElem
        .css({
            left: (time_scale * clip.start) + "px",
            width: (time_scale * clip.duration) + "px",
            zIndex: parseInt(clip.start)
        })
        .find(".text")
        .text(clip.content.pitch);

    // add the newly-filled template to the list
    $("#layer_" + layer_id)
        .find(".clipTimeline").append($clipElem);
}

// This is a closure. I'm not explaining JS closures today.
var startDragClip = (function() {
    const xVal = "clientX",
        yVal = "clientY",
        dragging = "dragging";
    var oldStartLeft = -1,
        oldMouseX = -1,
        oldInstrument = -1,
        instrumentHeight = -1,
        $newInstrument,
        oldScrollX = -1,
        oldStartTop = -1;
    return function(event) {
            var $clip = $(event.target);
            $clip.addClass(dragging);
            oldStartLeft = parseFloat($clip.css("left"));
            oldMouseX = parseFloat(event[xVal]);
            oldInstrument = parseInt($clip.parentsUntil("#content").last()
                .attr("id").split("_")[1]);
            oldStartTop = $clip.parentsUntil("#content").last()
                .position().top;
            var newX = -1;
            oldScrollX = $(window).scrollLeft();

            var $tempInstrument = $("#instrumentTemplate");
            instrumentHeight = $tempInstrument.height() +
                parseInt($tempInstrument.css("margin-bottom"));

            var $instruments = $(".instrument:not(.persistant)");
            var mouseMove = function(event) {
                // Handle x movement
                var deltaX = event[xVal] - oldMouseX;
                var deltaScrollX = $(window).scrollLeft() - oldScrollX;
                newX = oldStartLeft + deltaX + deltaScrollX;
                newX = Math.max(0, newX);
                $clip.css("left", newX + "px");

                // handle y movement (change of instrument)
                $newInstrument = whichInstrumentForY($instruments,
                    event[yVal],
                    instrumentHeight);
                if ($newInstrument != null) {
                    var newY = $newInstrument.position().top - oldStartTop;
                    $clip.css("top", newY + "px");
                } else {
                    $newInstrument = $clip.parentsUntil("#content").last();
                }
            };
            var end = function(event) {
                $clip.removeClass(dragging);
                $(document).off("mouseup", end)
                    .off("mousemove", mouseMove);
                // Update the server
                var instrID = parseInt($newInstrument.attr("id")
                    .split("_")[1]);
                var clipID = parseInt($clip.attr("id").split("_")[1]);
                var clipData = getClipDataForClipId(clipID);
                $("#clip_" + clipData.id).css({
                    "background": "red",
                    "z-index": 609290
                });
                setTimeout(function() {
                    $(".clip").css({
                        background: "",
                        zIndex: ""
                    });
                }, 500);
                console.log(clipData.id);
                var clipInd = updateClipData(clipID,
                    instrID,
                    newX / time_scale,
                    clipData.data.duration);
                $.ajax({
                    url: "../Backend/objectcommand.php",
                    type: "POST",
                    data: $.param({
                        ACTION: "UPDATE",
                        CLASS: "Clips",
                        ID: clipID,
                        DATA: JSON.stringify(clipData.data)
                    }),
                    success: function(result, status) {
                        console.log(result);
                        console.log("Success sending clip data");
                    },
                    failure: function(result, status) {
                        console.log("Failure sending clip data");
                    }
                });
            };
            $(document).mousemove(mouseMove).mouseup(end);
        }
        // find which instrument the y-position is referring to
    function whichInstrumentForY($instruments, y, instrumentHeight) {
        var size = $instruments.size();
        for (var i = 0; i < size; i++) {
            if ((i + 1) * instrumentHeight > y) {
                return $instruments.eq(i);
            }
        }
        return null;
    }
})();

function updateClipData(id, instrument, startTime, duration) {
    var ind = getClipIndexForClipId(id);
    var clip = data.clips[ind];
    if (clip != undefined && clip.data != undefined) {
        clip.data.instrument = instrument;
        clip.data.startTime = startTime;
        clip.data.duration = duration;
        buildTable();
    }
    return ind;
}

function addNewClipObject(instrument, startTime, server) {
    var id = getRandomInt(1, 10000000);

    var fpitch = window.prompt("your favorite sound ('E5', 'C7', etc.)");
    var ftime = window.prompt("your favorite starting time");
    var fdura = window.prompt("your favorite....duration?");

    var firstNote = [{
        note: fpitch,
        time: ftime,
        dura: fdura
    }]

    var newClip = data.clips.push({
        id: id,
        data: {
            instrument: instrument,
            startTime: startTime,
            duration: DEFAULT_DURATION,
            type: "note",
            contents: firstNote
        }
    });


    // if (server && server != undefined) {
    serverCreate("Clips", id, data.clips[data.clips.length - 1].data, function() {
        console.log("OGIEHEOIEHG:EGP");

    });
    //}
}

function editClip(event) {

    var newnote = window.prompt("pick a new note and we'll slap it on the end");
    var newtime = window.prompt("when should it start?");
    var newdura = window.prompt("how long should it be?");

    addNoteToClip(event.target.id.substring(event.target.id.indexOf('_') + 1), newnote, newtime, newdura);
}

function getClipIndexForClipId(id) {
    for (var i = 0; i < data.clips.length; i++) {
        if (data.clips[i].id == id) {
            return i;
        }
    }
}

function getClipDataForClipId(id) {
    return data.clips[getClipIndexForClipId(id)];
}

// Returns a random integer between min (included) and max (included)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkForAdd(event) {
    var xVal = "clientX",
        yVal = "clientY";
    if ($(event.target).is(".clipTimeline")) { // clicked the background
        var $tempInstrument = $("#instrumentTemplate");
        var instrumentHeight = $tempInstrument.height() +
            parseInt($tempInstrument.css("margin-bottom"));
        var instrumentInd = Math.floor(event[yVal] / instrumentHeight);
        var time = (event[xVal] - 200) / time_scale;
        addNewClipObject(instrumentInd + 1, time);
        buildTable();
    }
}

// a function to run a function every x seconds
function everyXSeconds(x, func) {
    func();
    setTimeout(function() {
        everyXSeconds(x, func);
    }, x * 1000);
}

// poll the database occasionally to see what updates have occured:
// any updates should be handled
var lastTime = Date.now();

function pollUpdates() {
    /*
	everyXSeconds(POLL_FREQUENCY, function() {
		$.get("../Backend/requestupdates.php?TIMESTAMP=" +
			(lastTime - lastTime),
			null,
			function(result, status) {
				result = result.split("\"data\": }").join("\"data\": {}}")
					.split("\"data\": \n}").join("\"data\": {}}")
					.split("\"data\":\n }").join("\"data\": {}}")
					.split("\"data\":  }").join("\"data\": {}}")
					.split("\"data\":\n}").join("\"data\": {}}")
					.split("\"data\": \r}").join("\"data\": {}}")
					.split("\"data\":\r }").join("\"data\": {}}")
					.split("\"data\":  }").join("\"data\": {}}")
					.split("\"data\":\r}").join("\"data\": {}}");
				result = JSON.parse(result);
				//console.log(result);
				if (status == "success" && result.length) {
					while (result.length > 0) {
						//if (result != undefined) {
						handleUpdate(result.pop());
						//}
					}
				}
			});
		lastTime = Date.now() - POLL_FREQUENCY;
	});*/
}

// given an update data row, do the necessary changes locally
function handleUpdate(update) {
    //console.log(JSON.stringify(update));
    if (update.action == "UPDATE") {
        if (update.class == "Clips") {
            console.log("Handle UPDATE");
            updateClipData(update.objectID,
                update.data.instrument,
                update.data.startTime,
                update.data.duration,
                update.data.type,
                update.data.contents);
        }
    } else if (update.action == "CREATE") {
        if (update.class == "Clips") {
            console.log("Handle CREATE");
            addNewClipObject(update.data.instrument,
                update.data.startTime,
                false);
        }
    }
}