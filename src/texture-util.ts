// texture-util - texture creation utilities
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export function loadSimpleTexture(rc: RenderContext, filePath: string, mipmaps = false): Promise<render.Texture> {
		return new Promise<render.Texture>(function(resolve, reject) {
			const image = new Image();

			image.onload = function() {
				const td = render.makeTexDesc2DFromImageSource(image, render.useMipMaps(mipmaps));
				const texture = new render.Texture(rc, td);
				resolve(texture);
			};
			image.onerror = function() {
				assert(false, "Image " + filePath + "does not exist");
				reject();
			};

			image.src = filePath;
		});
	}


	export function loadCubeTexture(rc: RenderContext, filePaths: string[]): Promise<render.Texture> {
		assert(filePaths.length == 6, "must have 6 paths for cube tex");

		return new Promise<render.Texture>(function(resolve, reject) {
			const images: HTMLImageElement[] = [];
			var loaded = 0;

			for (var k = 0; k < 6; ++k) {
				(function(face: number) {
					const image = new Image();

					image.onload = function() {
						images[face] = image;
						++loaded;

						if (loaded == 6) {
							const td = render.makeTexDescCubeFromImageSources(images);
							const texture = new render.Texture(rc, td);
							resolve(texture);
						}
					};
					image.onerror = function() {
						assert(false, "Image " + filePaths[face] + "does not exist");
						reject();
					};

					image.src = filePaths[face];
				} (k));
			}
		});
	}


	export function makeCubeMapPaths(basePath: string, extension: string): string[] {
		return [
			basePath + "posx" + extension,
			basePath + "negx" + extension,
			basePath + "posy" + extension,
			basePath + "negy" + extension,
			basePath + "posz" + extension,
			basePath + "negz" + extension
		];
	}

} // ns sd.render
