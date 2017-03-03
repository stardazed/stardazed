// image/loader - image loading frontend
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export function loadImage(url: URL, extension?: string): Promise<PixelDataProvider>;
	export function loadImage(buffer: ArrayBufferView, extension: string): Promise<PixelDataProvider>;
	export function loadImage(source: URL | ArrayBufferView, extension?: string): Promise<PixelDataProvider> {
		return (source instanceof URL) ? loadImageFromURL(source) : loadImageFromBufferView(source, extension!);
	}

	// ----

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

	function loadImageFromURL(url: URL, extension?: string): Promise<PixelDataProvider> {
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
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromURL(url);
				}
				return io.loadFile<ArrayBuffer>(url.href, { responseType: io.FileLoadType.ArrayBuffer })
					.then<PixelDataProvider>(buf => {
						return new TGADataProvider(new Uint8ClampedArray(buf));
					});
			});
		}

		return loadBuiltInImageFromURL(url);
	}


	function loadImageFromBufferView(view: ArrayBufferView, extension: string): Promise<PixelDataProvider> {
		if (extension === "tga") {
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromBufferView(view, extension);
				}
				else {
					return new TGADataProvider(view);
				}
			});
		}

		if (extension === "dds") {
			return Promise.resolve(new DDSDataProvider(view));
		}

		return loadBuiltInImageFromBufferView(view, extension);
	}


	//  ___      _ _ _       _
	// | _ )_  _(_) | |_ ___(_)_ _
	// | _ \ || | | |  _|___| | ' \
	// |___/\_,_|_|_|\__|   |_|_||_|
	//

	class HTMLImageDataProvider implements PixelDataProvider {
		readonly colourSpace: ColourSpace;
		readonly format: PixelFormat;
		readonly dim: PixelDimensions;
		readonly mipMapCount = 1;

		constructor(private image_: HTMLImageElement, extension?: string) {
			if (! extension) {
				const realSrc = image_.currentSrc || image_.src;
				extension = io.fileExtensionOfURL(realSrc);
			}

			this.colourSpace = (["jpg", "png"].indexOf(extension) > -1) ? ColourSpace.sRGB : ColourSpace.Linear;
			this.format = (this.colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
			this.dim = makePixelDimensions(image_.width, image_.height);
		}

		pixelBufferForLevel(level: number): PixelBuffer | null {
			if (level !== 0) {
				return null;
			}

			return {
				colourSpace: this.colourSpace,
				format: this.format,
				dim: { ...this.dim },
				data: this.image_
			};
		}
	}

	function loadBuiltInImageFromURL(url: URL) {
		return new Promise<PixelDataProvider>(function(resolve, reject) {
			const image = new Image();
			image.onload = () => {
				resolve(new HTMLImageDataProvider(image));
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


	function loadBuiltInImageFromBufferView(view: ArrayBufferView, extension: string) {
		return new Promise<PixelDataProvider>(function(resolve, reject) {
			const blob = new Blob([view], { type: extension });

			io.BlobReader.readAsDataURL(blob).then(
				dataURL => {
					const image = new Image();
					image.onload = () => {
						resolve(new HTMLImageDataProvider(image));
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
