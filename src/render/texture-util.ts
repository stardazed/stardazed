// texture-util - texture creation utilities
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { RenderContext } from "render/rendercontext";
import { Texture, useMipMaps, makeTexDesc2DFromImageSource, makeTexDescCubeFromImageSources } from "render/texture";

export function loadSimpleTexture(rc: RenderContext, filePath: string, mipmaps = false): Promise<Texture> {
	return new Promise<Texture>(function(resolve, reject) {
		const image = new Image();

		image.onload = function() {
			const td = makeTexDesc2DFromImageSource(image, useMipMaps(mipmaps));
			const texture = new Texture(rc, td);
			resolve(texture);
		};
		image.onerror = function() {
			assert(false, `Image ${filePath} does not exist`);
			reject();
		};

		image.src = filePath;
	});
}


export function loadCubeTexture(rc: RenderContext, filePaths: string[]): Promise<Texture> {
	assert(filePaths.length == 6, "must have 6 paths for cube tex");

	return new Promise<Texture>(function(resolve, reject) {
		const images: HTMLImageElement[] = [];
		let loaded = 0;

		for (let k = 0; k < 6; ++k) {
			(function(face: number) {
				const image = new Image();

				image.onload = function() {
					images[face] = image;
					++loaded;

					if (loaded == 6) {
						const td = makeTexDescCubeFromImageSources(images);
						const texture = new Texture(rc, td);
						resolve(texture);
					}
				};
				image.onerror = function() {
					assert(false, `Image ${filePaths[face]} does not exist`);
					reject();
				};

				image.src = filePaths[face];
			} (k));
		}
	});
}


export function makeCubeMapPaths(basePath: string, extension: string): string[] {
	return [
		basePath + `posx${extension}`,
		basePath + `negx${extension}`,
		basePath + `posy${extension}`,
		basePath + `negy${extension}`,
		basePath + `posz${extension}`,
		basePath + `negz${extension}`
	];
}
