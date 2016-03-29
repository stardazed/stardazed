// asset-io.ts - Asset file helpers
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


	export function resolveRelativeFilePath(relPath: string, basePath: string) {
		var normRelPath = relPath.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/^\//, "");
		var normBasePath = basePath.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/^\//, "");

		var relPathParts = normRelPath.split("/");
		var basePathParts = normBasePath.split("/");

		// remove trailing filename, which we can only identify by a dot in the name...
		if (basePathParts.length > 0 && basePathParts[basePathParts.length - 1].indexOf(".") > 0) {
			basePathParts.pop();
		}

		for (var entry of relPathParts) {
			if (entry == ".") {
			}
			else if (entry == "..") {
				basePathParts.pop();
			}
			else {
				basePathParts.push(entry);
			}
		}

		return basePathParts.join("/");
	}


	export function fileExtensionOfFilePath(filePath: string): string {
		var lastDot = filePath.lastIndexOf(".");
		if (lastDot > -1) {
			var ext = filePath.substr(lastDot + 1);
			return ext.toLowerCase();
		}
		return "";
	}

	const mimeTypeMapping: { [extension: string]: string } = {
		"bm": "image/bmp",
		"bmp": "image/bmp",
		"png": "image/png",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"tga": "image/tga",
		"gif": "image/gif"
	};

	export function mimeTypeForFilePath(filePath: string): string {
		var ext = fileExtensionOfFilePath(filePath);
		return mimeTypeMapping[ext] || null;
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


	export function loadImage(srcPath: string): Promise<ImageData | HTMLImageElement> {
		return new Promise(function(resolve, reject) {
			var nativeLoader = () => {
				var image = new Image();
				image.onload = function() { resolve(image); };
				image.onerror = function() { reject(srcPath + " doesn't exist or is not supported"); };
				image.src = srcPath;
			};

			if (fileExtensionOfFilePath(srcPath) == "tga") {
				hasNativeTGASupport().then(nativeTGA => {
					if (nativeTGA) {
						nativeLoader();
					}
					else {
						loadFile(srcPath, { responseType: FileLoadType.ArrayBuffer }).then(
							(buffer: ArrayBuffer) => {
								var tga: ImageData = null;
								if (buffer && buffer.byteLength > 0) {
									tga = loadTGAImageBuffer(buffer);
									if (tga) {
										resolve(tga);
									}
								}
								if (! tga) {
									reject("File not found or unsupported TGA format.");
								}
							},
							(error) => {
								reject(error);
							}
						);
					}
				});
			}
			else {
				nativeLoader();
			}
		});
	}


	export function loadImageFromBuffer(buffer: ArrayBuffer, mimeType: string): Promise<ImageData | HTMLImageElement> {
		return new Promise((resolve, reject) => {
			var nativeImageLoader = () => {
				// Create an image in a most convolated manner. Hurrah for the web.
				var str = convertBytesToString(new Uint8Array(buffer));
				var b64 = btoa(str);
				str = "data:" + mimeType + ";base64," + b64;
				var img = new Image();
				img.onload = () => { resolve(img); };
				img.onerror = () => { reject("Bad or unsupported image data."); };
				img.src = str;
			};

			if (mimeType == "image/tga") {
				hasNativeTGASupport().then(nativeTGA => {
					if (nativeTGA) {
						nativeImageLoader();
					}
					else {
						let tga = loadTGAImageBuffer(buffer);
						if (tga) {
							resolve(tga);
						}
						else {
							reject("Unsupported TGA format.");
						}
					}
				});
			}
			else {
				nativeImageLoader();
			}
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
		return loadImage(src).then(function(imageOrData) {
			if ("data" in imageOrData) {
				return <ImageData>imageOrData
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


	export function debugDumpPixelData(pixels: Uint8Array, width: number, height: number) {
		var cvs = document.createElement("canvas");
		cvs.width = width;
		cvs.height = height;
		var ctx = cvs.getContext("2d");
		var id = ctx.createImageData(width, height);
		id.data.set(pixels);
		ctx.putImageData(id, 0, 0);
		document.body.appendChild(cvs);
	}


} // ns sd.asset
