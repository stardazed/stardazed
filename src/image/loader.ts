// image/loader - image loading frontend
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export function loadImage(url: URL, colourSpace: ColourSpace, extension?: string): Promise<PixelDataProvider>;
	export function loadImage(buffer: ArrayBufferView, colourSpace: ColourSpace, extension: string): Promise<PixelDataProvider>;
	export function loadImage(source: URL | ArrayBufferView, colourSpace: ColourSpace, extension?: string): Promise<PixelDataProvider> {
		return (source instanceof URL) ? loadImageFromURL(source, colourSpace, extension) : loadImageFromBufferView(source, colourSpace, extension!);
	}

	// ----

	function loadImageFromURL(url: URL, colourSpace: ColourSpace, extension?: string): Promise<PixelDataProvider> {
		if (! extension) {
			extension = io.fileExtensionOfURL(url);
		}
		if (! extension) {
			return Promise.reject(`Cannot determine file type of '${url}'`);
		}

		if (extension === "dds") {
			return io.loadFile<ArrayBuffer>(url.href, { responseType: io.FileLoadType.ArrayBuffer })
				.then(buf => {
					return new DDSDataProvider(new Uint8ClampedArray(buf));
				});
		}

		if (extension === "tga") {
			return io.loadFile<ArrayBuffer>(url.href, { responseType: io.FileLoadType.ArrayBuffer })
				.then<PixelDataProvider>(buf => {
					return new TGADataProvider(new Uint8ClampedArray(buf));
				});
		}

		return loadBuiltInImageFromURL(url, colourSpace);
	}


	function loadImageFromBufferView(view: ArrayBufferView, colourSpace: ColourSpace, extension: string): Promise<PixelDataProvider> {
		if (extension === "tga") {
			return Promise.resolve(new TGADataProvider(view));
		}
		if (extension === "dds") {
			return Promise.resolve(new DDSDataProvider(view));
		}

		return loadBuiltInImageFromBufferView(view, colourSpace, extension);
	}


	//  ___      _ _ _       _
	// | _ )_  _(_) | |_ ___(_)_ _
	// | _ \ || | | |  _|___| | ' \
	// |___/\_,_|_|_|\__|   |_|_||_|
	//

	function loadBuiltInImageFromURL(url: URL, colourSpace: ColourSpace) {
		return new Promise<PixelDataProvider>((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				resolve(new HTMLImageDataProvider(image, colourSpace));
			};
			image.onerror = () => {
				if (url.protocol === "data:") {
					reject(`Data URL '${url.href.substr(0, 72)}...' is not supported or malformed`);
				}
				else {
					reject(`The file at '${url.href}' doesn't exist or is not supported`);
				}
			};

			// When requesting cross-domain media, always try the CORS route
			// GL will not allow tainted data to be loaded so if it fails, we can't use the image anyway
			if (url.protocol !== "data:" && url.origin !== location.origin) {
				image.crossOrigin = "anonymous";
			}
			image.src = url.href;
		});
	}


	function loadBuiltInImageFromBufferView(view: ArrayBufferView, colourSpace: ColourSpace, extension: string) {
		const blob = new Blob([view], { type: extension });

		return io.BlobReader.readAsDataURL(blob).then(
			dataURL => loadBuiltInImageFromURL(new URL(dataURL), colourSpace)
		);
	}

} // ns sd.image
