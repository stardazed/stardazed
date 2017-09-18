// asset/parser/image - image asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {

	export namespace parser {
		export interface AudioAssetMetadata {
		}

		/**
		 * Create an AudioBuffer for an asset blob
		 * @param resource The source data to be parsed
		 */
		export const parseAudio: AssetParser<Audio, AudioAssetMetadata> = (resource: RawAsset<AudioAssetMetadata>) =>
			getArrayBuffer(resource).then(
				data => new Promise<Audio>((resolve, reject) => {
					audio.sharedAudioContext().decodeAudioData(
						data,
						audioData => {
							resolve({
								...makeAsset("audio", resource.name),
								buffer: audioData
							});
						},
						err => {
							reject(`Invalid audio data, error: ${err}`);
						}
					);
				})
			);

		registerFileExtension("mp3", "audio/mpeg");
		registerFileExtension("m4a", "audio/mp4");
		registerFileExtension("mp4", "audio/mp4");

		registerFileExtension("ogg", "audio/ogg");
		
		registerFileExtension("wav", "audio/vnd.wav");
		registerFileExtension("aif", "audio/x-aiff");
		registerFileExtension("aifc", "audio/x-aiff");
		registerFileExtension("aiff", "audio/x-aiff");

	} // ns parser

	export interface Audio extends Asset {
		buffer: AudioBuffer;
	}

	export interface Library {
		loadAudio(sa: parser.RawAsset): Promise<Audio>;
		audioByName(name: string): Audio | undefined;
	}
	registerAssetLoaderParser("audio", parser.parseAudio);

} // ns sd.asset
