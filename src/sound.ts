// sound - Web SoundManager
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="game.ts" />

declare var webkitAudioContext: {
    prototype: AudioContext;
    new (): AudioContext;
}

interface Window {
	webkitAudioContext?: AudioContext;
	AudioContext?: AudioContext;
}

class SoundManager {
	context: AudioContext;

	constructor() {
		this.context = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
		//assert(this.context, "No sound");
	}

	get valid() {
		return this.context != null;
	}

	loadSoundFile(filePath: string): Promise<AudioBuffer> {
		return loadFile(filePath, {
			responseType: FileLoadType.ArrayBuffer
		}).then((data: ArrayBuffer) => {
			return new Promise<AudioBuffer>((resolve, reject) => {
				if (! this.valid) {
					resolve(null);
					return;
				}
				this.context.decodeAudioData(data,
					(audioData: AudioBuffer) => {
						resolve(audioData);
					},
					() => {
						assert(false, "Audio file not found: " + filePath);
						reject("file not found");
					}
				);
			});
		});
	}
}
