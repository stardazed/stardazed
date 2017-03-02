// image/loader - image loading frontend
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	let nativeTGASupport: boolean | null = null;

	function checkNativeTGASupport(): Promise<boolean> {
		if (nativeTGASupport === null) {
			return new Promise((resolve, _) => {
				const img = new Image();
				img.onload = () => { nativeTGASupport = true; resolve(true); };
				img.onerror = () => { nativeTGASupport = false; resolve(false); };
				img.src = "data:image/tga;base64,AAACAAAAAAAAAAAAAQABABgA////";
			});
		}

		return Promise.resolve(nativeTGASupport);
	}

	function tgaLoader(source: URL | ArrayBufferView): Promise<PixelDataProvider> {
		if (source instanceof URL) {
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromURL(source).then(image => {
						return image;
					});
				}
				else {
					return io.loadFile(source.href, { responseType: io.FileLoadType.ArrayBuffer }).then((buf: ArrayBuffer) => {
						return loadTGAImageFromBufferView(buf);
					});
				}
			});
		}
		else {
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromBuffer(source, mimeType).then(image => {
						return image;
					});
				}
				else {
					return Promise.resolve(loadTGAImageFromBufferView(source));
				}
			});
		}
	}

	export function loadImage(source: URL | ArrayBufferView, mimeType?: string): Promise<PixelDataProvider> {
		if (! mimeType) {
			const extension = io.fileExtensionOfURL(url);
			mimeType = mimeTypeForFileExtension(extension);
		}
		if (! mimeType) {
			return Promise.reject(`Cannot determine mime-type of '${url}'`);
		}
	}


	// ----


	function loadImageURL(url: URL, mimeType?: string): Promise<ImageData | HTMLImageElement> {
		if (! mimeType) {
			const extension = fileExtensionOfURL(url);
			mimeType = mimeTypeForFileExtension(extension);
		}
		if (! mimeType) {
			return Promise.reject(`Cannot determine mime-type of '${url}'`);
		}

		const loader = urlLoaderForMIMEType(mimeType);
		if (! loader) {
			return Promise.reject(`No buffer loader available for mime-type '${mimeType}'`);
		}
		else {
			return loader(url, mimeType).then(group => {
				const tex = group.textures[0];
				if (tex && tex.descriptor && tex.descriptor.pixelData && (tex.descriptor.pixelData.length === 1)) {
					return tex.descriptor.pixelData[0];
				}
				else {
					throw new Error("Internal error in image loader.");
				}
			});
		}
	}


	function loadImageFromBuffer(buffer: ArrayBuffer, mimeType: string): Promise<ImageData | HTMLImageElement> {
		const loader = bufferLoaderForMIMEType(mimeType);
		if (! loader) {
			return Promise.reject(`No buffer loader available for mime-type '${mimeType}'`);
		}
		else {
			return loader(buffer, mimeType).then(group => {
				const tex = group.textures[0];
				if (tex && tex.descriptor && tex.descriptor.pixelData && (tex.descriptor.pixelData.length === 1)) {
					return tex.descriptor.pixelData[0];
				}
				else {
					throw new Error("Internal error in image loader.");
				}
			});
		}
	}


	//  ___      _ _ _       _
	// | _ )_  _(_) | |_ ___(_)_ _
	// | _ \ || | | |  _|___| | ' \
	// |___/\_,_|_|_|\__|   |_|_||_|
	//

	function loadBuiltInImageFromURL(url: URL) {
		return new Promise<HTMLImageElement>(function(resolve, reject) {
			const image = new Image();
			image.onload = () => {
				resolve(image);
			};
			image.onerror = () => {
				reject(`${url.href} doesn't exist or is not supported`);
			};

			// When requesting cross-domain media, always try the CORS route
			// GL will not allow tainted data to be loaded so if it fails, we can't use the image anyway
			if (url.origin !== location.origin) {
				image.crossOrigin = "anonymous";
			}
			image.src = url.href;
		});
	}


	function loadBuiltInImageFromBuffer(buffer: ArrayBuffer, mimeType: string) {
		return new Promise<HTMLImageElement>(function(resolve, reject) {
			const blob = new Blob([buffer], { type: mimeType });

			BlobReader.readAsDataURL(blob).then(
				dataURL => {
					const img = new Image();
					img.onload = () => {
						resolve(img);
					};
					img.onerror = () => {
						reject("Bad or unsupported image data.");
					};
					img.src = dataURL;
				},
				error => {
					reject(error);
				}
			);
		});
	}


	function builtInImageLoader(source: URL | ArrayBuffer, mimeType: string) {
		const imagePromise = (source instanceof URL) ? loadBuiltInImageFromURL(source) : loadBuiltInImageFromBuffer(source, mimeType);
		return imagePromise.then(img => {
			return assetGroupForImage(img);
		});
	}

} // ns sd.image
