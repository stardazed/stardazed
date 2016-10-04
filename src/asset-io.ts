// asset-io.ts - Asset file helpers
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

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


	export function loadFile(url: URL | string, opts?: FileLoadOptions) {
		return new Promise(function(resolve, reject) {
			opts = opts || {};

			var xhr = new XMLHttpRequest();
			if (opts.tryBreakCache) {
				url += "?__ts=" + Date.now();
			}
			xhr.open("GET", (url instanceof URL) ? url.href : url);
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
				assert(false, url + " doesn't exist");
				reject(url + " doesn't exist");
			};

			xhr.send();
		});
	}


	export class BlobReader {
		private constructor() {}

		private static readerPromise<T>(): { promise: Promise<T>, reader: FileReader } {
			const reader = new FileReader();
			const promise = new Promise<T>((resolve, reject) => {
				reader.onerror = () => {
					reject(reader.error);	
				};
				reader.onabort = () => {
					reject("Blob load was aborted.");
				};
				reader.onload = () => {
					resolve(reader.result);
				};
			});

			return { promise, reader };
		}

		static readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
			const pr = this.readerPromise<ArrayBuffer>();
			pr.reader.readAsArrayBuffer(blob);
			return pr.promise;
		}

		static readAsDataURL(blob: Blob): Promise<string> {
			const pr = this.readerPromise<string>();
			pr.reader.readAsDataURL(blob);
			return pr.promise;
		}

		static readAsText(blob: Blob, encoding?: string): Promise<string> {
			const pr = this.readerPromise<string>();
			pr.reader.readAsText(blob, encoding);
			return pr.promise;
		}
	}


	// TODO: temp
	export function resolveTextures(textures: (asset.Texture2D | null)[]) {
		return Promise.all(textures.map(tex => {
			if (! tex) {
				return null;
			}
			if (! tex.url || (tex.descriptor && tex.descriptor.pixelData)) {
				return tex;
			}

			return loadImageURL(tex.url).then(img => {
				tex.descriptor = render.makeTexDesc2DFromImageSource(img, tex.useMipMaps);
				return tex;
			}).catch(error => {
				console.warn("resolveTextures error: ", error);
				return null;
			})
		}).filter(p => !!p));
	}



	export function imageData(image: HTMLImageElement): ImageData {
		var cvs = document.createElement("canvas");
		cvs.width = image.width;
		cvs.height = image.height;
		var tc = cvs.getContext("2d")!;
		tc.drawImage(image, 0, 0);

		return tc.getImageData(0, 0, image.width, image.height);
	}


	export function loadImageDataURL(url: URL): Promise<ImageData> {
		return loadImageURL(url).then(function(imageOrData) {
			if ("data" in imageOrData) {
				return <ImageData>imageOrData;
			}
			else {
				return imageData(<HTMLImageElement>imageOrData);
			}
		});
	}


	export function loadSoundFile(ac: audio.AudioContext, filePath: string): Promise<AudioBuffer> {
		return loadFile(filePath, {
			responseType: FileLoadType.ArrayBuffer
		}).then((data: ArrayBuffer) => {
			return audio.makeAudioBufferFromData(ac, data);
		});
	}


	export function convertBytesToString(bytes: Uint8Array) {
		var strings: string[] = [];

		var bytesLeft = bytes.length;
		var offset = 0;
		const maxBlockSize = 65536; // max parameter array size for use in Webkit

		while (bytesLeft > 0) {
			let blockSize = Math.min(bytesLeft, maxBlockSize);
			let str: string = String.fromCharCode.apply(null, bytes.subarray(offset, offset + blockSize));
			strings.push(str);
			offset += blockSize;
			bytesLeft -= blockSize;
		}

		return strings.length == 1 ? strings[0] : strings.join("");
	}


	export function debugDumpPixelData(pixels: Uint8Array, width: number, height: number) {
		var cvs = document.createElement("canvas");
		cvs.width = width;
		cvs.height = height;
		var ctx = cvs.getContext("2d")!;
		var id = ctx.createImageData(width, height);
		id.data.set(pixels);
		ctx.putImageData(id, 0, 0);
		document.body.appendChild(cvs);
	}


} // ns sd.asset
