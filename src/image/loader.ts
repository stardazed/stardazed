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

	class HTMLImageDataProvider implements PixelDataProvider {
		readonly colourSpace: ColourSpace;
		readonly pixelFormat: PixelFormat;
		readonly dim: PixelDimensions;
		readonly mipMapCount = 1;

		constructor(private image_: HTMLImageElement, colourSpace: ColourSpace, extension?: string) {
			if (! extension) {
				const realSrc = image_.currentSrc || image_.src;
				extension = io.fileExtensionOfURL(realSrc);
			}

			this.colourSpace = colourSpace;
			this.pixelFormat = (this.colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
			this.dim = makePixelDimensions(image_.width, image_.height);
		}

		pixelBufferForLevel(level: number): PixelBuffer | undefined {
			if (level !== 0) {
				return undefined;
			}

			return {
				colourSpace: this.colourSpace,
				pixelFormat: this.pixelFormat,
				dim: { ...this.dim },
				data: this.image_
			};
		}
	}

	function loadBuiltInImageFromURL(url: URL, colourSpace: ColourSpace) {
		return new Promise<PixelDataProvider>((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				resolve(new HTMLImageDataProvider(image, colourSpace));
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


	function loadBuiltInImageFromBufferView(view: ArrayBufferView, colourSpace: ColourSpace, extension: string) {
		return new Promise<PixelDataProvider>((resolve, reject) => {
			const blob = new Blob([view], { type: extension });

			io.BlobReader.readAsDataURL(blob).then(
				dataURL => {
					const image = new Image();
					image.onload = () => {
						resolve(new HTMLImageDataProvider(image, colourSpace));
					};
					image.onerror = () => {
						reject("Bad or unsupported image data.");
					};
					image.src = dataURL;
				},
				error => {
					reject(error);
				}
			);
		});
	}

} // ns sd.image
