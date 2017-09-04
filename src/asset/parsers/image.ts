// asset/image - image asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export function loadImage(source: URL | ArrayBufferView, colourSpace: image.ColourSpace, mimeType: string): Promise<image.PixelDataProvider> {
		return (source instanceof URL) ?
			loadImageFromURL(source, colourSpace, mimeType) :
			loadImageFromBufferView(source, colourSpace, mimeType);
	}

	function loadImageFromURL(url: URL, colourSpace: image.ColourSpace, mimeType: string): Promise<image.PixelDataProvider> {
		if (mimeType === "image/dds") {
			return io.loadFile<ArrayBuffer>(url.href, { responseType: io.FileLoadType.ArrayBuffer })
				.then(buf => {
					return new image.DDSDataProvider(new Uint8ClampedArray(buf));
				});
		}

		if (mimeType === "image/tga") {
			return io.loadFile<ArrayBuffer>(url.href, { responseType: io.FileLoadType.ArrayBuffer })
				.then<image.PixelDataProvider>(buf => {
					return new image.TGADataProvider(new Uint8ClampedArray(buf));
				});
		}

		return loadBuiltInImageFromURL(url, colourSpace);
	}


	function loadImageFromBufferView(view: ArrayBufferView, colourSpace: image.ColourSpace, mimeType: string): Promise<image.PixelDataProvider> {
		if (mimeType === "image/tga") {
			return new Promise(resolve => resolve(new image.TGADataProvider(view)));
		}
		if (mimeType === "image/dds") {
			return new Promise(resolve => resolve(new image.DDSDataProvider(view)));
		}

		return loadBuiltInImageFromBufferView(view, colourSpace, mimeType);
	}


	function loadBuiltInImageFromURL(url: URL, colourSpace: image.ColourSpace) {
		return new Promise<image.PixelDataProvider>((resolve, reject) => {
			const builtin = new Image();
			builtin.onload = () => {
				resolve(new image.HTMLImageDataProvider(builtin, colourSpace));
			};
			builtin.onerror = () => {
				if (url.protocol === "data:") {
					reject(`Data URL '${url.href.substr(0, 72)}...' is not supported or malformed`);
				}
				else if (url.protocol === "blob:") {
					reject(`The object referenced by '${url.href}' is not supported, malformed or inaccessible`);
				}
				else {
					reject(`The resource at '${url.href}' doesn't exist or is not supported`);
				}
			};

			// When requesting cross-domain media, always try the CORS route
			// GL will not allow tainted data to be loaded so if it fails, we can't use the image anyway
			if (url.protocol !== "data:" && url.protocol !== "blob:" && url.origin !== location.origin) {
				builtin.crossOrigin = "anonymous";
			}
			builtin.src = url.href;
		});
	}

	function loadBuiltInImageFromBufferView(view: ArrayBufferView, colourSpace: image.ColourSpace, mimeType: string) {
		const blob = new Blob([view], { type: mimeType });
		const blobURL = URL.createObjectURL(blob);

		return loadBuiltInImageFromURL(new URL(blobURL), colourSpace).then(
			provider => {
				URL.revokeObjectURL(blobURL);
				return provider;
			},
			err => {
				URL.revokeObjectURL(blobURL);
				throw err;
			}
		);

		// return io.BlobReader.readAsDataURL(blob).then(
		// 	dataURL => loadBuiltInImageFromURL(new URL(dataURL), colourSpace)
		// );
	}

} // ns sd.image
