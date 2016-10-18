# objectcommand.php

objectcommand.php allows a frontend to interact with the JamCloud database  
### POST Request Parmaters

**CLASS** - can be only be "Layers" for now  
**ID** - The object ID  
**ACTION** - The interaction command  
**DATA** - Object JSON data  

### Return Data
`{"status":status,"message":"<message>"}`  

`status` will be `true` or `false`

### Actions
**UPDATE** - Update object (requires data)
**DELETE** - Delete object
**CREATE** - Create object (required data)

# getdata.php
getdata.php returns objects as JSON
### POST/GET Request Prameters
**CLASS** - can only be "Layers" for now  
**STAMP** - UNIX time stamp
### Return Data
Returns as JSON in the format:  
  
    {
	"<id>":"<json data>",
	"<id>":"<json data>"
    }


# corgy/newmidi.py
Creates MIDI in corgy/audio based on form data
### POST Options
**NAME** output filename of MIDI file  
**DATA** (optional)data in JSON format  

Example JSON:  

`{"0":{"startTime": 0, "duration": 5,"contents":{"0":{"pitch":65, "time":1,"duration":6}}}}`
