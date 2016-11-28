// audio/audiocontext - web audio interfaces
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

declare global {
	const webkitAudioContext: {
		prototype: AudioContext;
		new (): AudioContext;
	};

	interface Window {
		webkitAudioContext?: typeof AudioContext;
		AudioContext?: typeof AudioContext;
	}
}

export interface AudioContextSD {
	ctx: AudioContext;
}

export function makeAudioBufferFromData(ac: AudioContextSD, data: ArrayBuffer): Promise<AudioBuffer> {
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


export function makeAudioContext(): AudioContextSD | null {
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
