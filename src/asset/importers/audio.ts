// asset/importers/audio - audio file importer
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../importer.ts" />

namespace sd.asset {

	export interface CacheAccess {
		(kind: "audio", name: string): AudioBuffer;
	}

	export namespace importer {

		export function importAudio(data: Blob, _uri: string) {
			return getArrayBuffer(data).then(buffer =>
				new Promise<AssetDependencies>((resolve, reject) => {
					audio.sharedAudioContext().decodeAudioData(
						buffer,
						audioData => {
							resolve({
								audio: {
									kind: "audio",
									item: audioData
								}
							});
						},
						err => {
							reject(`Invalid audio data, error: ${err}`);
						}
					);
				})
			);
		}

		registerImporter(importAudio, "audio/mpeg", "mp3");
		registerImporter(importAudio, "audio/mp4", ["m4a", "mp4"]);
		registerImporter(importAudio, "audio/ogg", "ogg");
		registerImporter(importAudio, "audio/vnd.wav", "wav");
		registerImporter(importAudio, "audio/x-aiff", ["aif", "aifc", "aiff"]);

	} // ns importer

} // ns sd.asset.parse
