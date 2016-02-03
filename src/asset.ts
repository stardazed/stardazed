// asset.ts - Common asset interfaces
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export enum FileLoadType {
		ArrayBuffer = 1,
		Blob,
		Document,
		JSON,
		Text
	}

	export interface FileLoadOptions {
		tryBreakCache?: boolean;
		mimeType?: string;
		responseType?: FileLoadType;
	}


	function responseTypeForFileLoadType(flt: FileLoadType) {
		switch (flt) {
			case FileLoadType.ArrayBuffer: return "arraybuffer";
			case FileLoadType.Blob: return "blob";
			case FileLoadType.Document: return "document";
			case FileLoadType.JSON: return "json";
			case FileLoadType.Text: return "text";
			default: return "";
		}
	}

	export function loadFile(filePath: string, opts?: FileLoadOptions) {
		return new Promise(function(resolve, reject) {
			opts = opts || {};

			var xhr = new XMLHttpRequest();
			if (opts.tryBreakCache) {
				filePath += "?__ts=" + Date.now();
			}
			xhr.open("GET", filePath);
			if (opts.responseType) {
				xhr.responseType = responseTypeForFileLoadType(opts.responseType);
			}
			if (opts.mimeType) {
				xhr.overrideMimeType(opts.mimeType);
			}

			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4) return;
				assert(xhr.status == 200 || xhr.status == 0);
				resolve(xhr.response);
			};

			xhr.onerror = function() {
				assert(false, filePath + " doesn't exist");
			};

			xhr.send();
		});
	}


	export function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise(function(resolve, reject) {
			var image = new Image();
			image.onload = function() { resolve(image); };
			image.onerror = function() { reject(src + " doesn't exist"); };
			image.src = src;
		});
	}


	export function imageData(image: HTMLImageElement): ImageData {
		var cvs = document.createElement("canvas");
		cvs.width = image.width;
		cvs.height = image.height;
		var tc = cvs.getContext("2d");
		tc.drawImage(image, 0, 0);

		return tc.getImageData(0, 0, image.width, image.height);
	}


	export function loadImageData(src: string): Promise<ImageData> {
		return loadImage(src).then(function(image) {
			return imageData(image);
		});
	}


	export function loadSoundFile(ac: audio.AudioContext, filePath: string): Promise<AudioBuffer> {
		return loadFile(filePath, {
			responseType: FileLoadType.ArrayBuffer
		}).then((data: ArrayBuffer) => {
			return audio.makeAudioBufferFromData(ac, data);
		});
	}

} // ns sd.asset
