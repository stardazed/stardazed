// audiocontext - web audio interfaces
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

declare let webkitAudioContext: {
	prototype: AudioContext;
	new (): AudioContext;
};

interface Window {
	webkitAudioContext?: typeof AudioContext;
	AudioContext?: typeof AudioContext;
}

type NativeAudioContext = AudioContext;


namespace sd.audio {

	export interface AudioContext {
		ctx: NativeAudioContext;
	}


	export function makeAudioBufferFromData(ac: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
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


	export function makeAudioContext(): audio.AudioContext | null {
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
