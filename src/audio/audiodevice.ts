// audio/device - audio interface
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

declare const webkitAudioContext: {
	prototype: AudioContext;
	new (): AudioContext;
};

namespace sd.audio {

	let sharedAudioContext_: AudioContext | undefined;

	/**
	 * @internal
	 */
	export function sharedAudioContext() {
		if (! sharedAudioContext_) {
			if ("AudioContext" in window) {
				sharedAudioContext_ = new AudioContext();
			}
			else if ("webkitAudioContext" in window) {
				sharedAudioContext_ = new webkitAudioContext();
			}
			else {
				throw new Error("WebAudio is not supported.");
			}
		}
		return sharedAudioContext_;
	}

	export interface AudioDevice {
		ctx: AudioContext;
	}

	export function makeAudioDevice(): AudioDevice {
		return {
			ctx: sharedAudioContext()
		};
	}

} // ns sd.audio
