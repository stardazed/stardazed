// asset/loaders/data-url - loader that parses base64-encoded data urls
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../loader.ts" />

namespace sd.asset.loader {
	
	/**
	 * Loads any base64-encoded data URL, always uses mime-type given in the URL
	 * @param _config ignored, this loader has no configuration options
	 */
	export const DataURLLoader: LoaderClass = (_config: {}) =>
		(uri: string, mimeType?: string) =>
			new Promise<Blob>((resolve, reject) => {
				if (uri.substr(0, 5) !== "data:") {
					return reject("Not a data url");
				}
				const marker = ";base64,";
				const markerIndex = uri.indexOf(marker);
				if (markerIndex <= 5) {
					return reject("Not a base64 data url");
				}

				// simply override any given mime-type with the one provided inside the url
				mimeType = uri.substring(5, markerIndex);

				// convert the data through the various stages of grief
				const data64 = uri.substr(markerIndex + marker.length);
				const dataStr = atob(data64);
				const dataArray = Array.prototype.map.call(dataStr, (_: string, i: number, s: string) => s.charCodeAt(i)) as number[];
				const data = new Uint8Array(dataArray);
				resolve(new Blob([data], { type: mimeType }));
			});

	registerLoaderClass("data-url", DataURLLoader);

} // ns sd.asset.loader
