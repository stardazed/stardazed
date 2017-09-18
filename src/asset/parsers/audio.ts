// asset/parser/audio - audio file parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset.parser {

	export const parseAudio: AssetProcessor = (asset: Asset<AudioBuffer, {}>) =>
		getArrayBuffer(asset).then(
			data => new Promise<Asset>((resolve, reject) => {
				audio.sharedAudioContext().decodeAudioData(
					data,
					audioData => {
						asset.item = audioData;
						resolve(asset);
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

	mapMimeTypeToAssetKind("audio/mpeg", "audio");
	mapMimeTypeToAssetKind("audio/mp4", "audio");
	mapMimeTypeToAssetKind("audio/ogg", "audio");
	mapMimeTypeToAssetKind("audio/vnd.wav", "audio");
	mapMimeTypeToAssetKind("audio/x-aiff", "audio");

	registerParser("audio", parseAudio);

} // ns sd.asset.parser
