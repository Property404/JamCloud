class Note {
	constructor(pitch){
		this.pitch = pitch;
	}
}
class SoundFile {
	constructor(address){
		this.address = address;
	}
}	
class Clip {
	constructor(start, duration, content){
		/* start time of clip */
		this.start = start;
		
		/* Duration time */
		this.duration = durations;

		/* Either a single Note or a SoundFile or something */
		this.content = content;
	};
}

class Layer {
	constructor(name, clips=[],instrument = 0){
		this.name = name;

		/* Instrument type, grand piano etc */
		this.instrument = instrument;

		/* An array of Clips */
		this.clips = clips;

	}
	addClip(clip){
		this.clips.push(clip);
	}
}

