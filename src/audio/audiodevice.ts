// audio/device - audio interfaces
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/** @internal */
declare const webkitAudioContext: {
	prototype: AudioContext;
	new (): AudioContext;
};

/** @internal */
interface Window {
	webkitAudioContext?: typeof AudioContext;
	AudioContext?: typeof AudioContext;
}


namespace sd.audio {

	export interface AudioDevice {
		ctx: AudioContext;
	}


	export function makeAudioBufferFromData(ac: AudioDevice, data: ArrayBuffer): Promise<AudioBuffer> {
		return new Promise<AudioBuffer>((resolve, reject) => {
			ac.ctx.decodeAudioData(
				data,
				audioData => {
					resolve(audioData);
				},
				() => {
					reject("invalid audio data");
				}
			);
		});
	}


	export function makeAudioDevice(): AudioDevice | null {
		const ac = window.AudioContext ? new (window.AudioContext)() : (window.webkitAudioContext ? new webkitAudioContext() : null);

		if (ac) {
			return {
				ctx: ac
			};
		}
		else {
			return null;
		}
	}

} // ns sd.audio
