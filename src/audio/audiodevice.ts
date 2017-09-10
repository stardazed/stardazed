// audio/device - audio interface
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

declare const webkitAudioContext: {
	prototype: AudioContext;
	new (): AudioContext;
};

interface Window {
	webkitAudioContext?: typeof AudioContext;
	AudioContext?: typeof AudioContext;
}


namespace sd.audio {

	let sharedAudioContext_: AudioContext | undefined;

	/**
	 * @internal
	 */
	export const sharedAudioContext = () => {
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
	};

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
