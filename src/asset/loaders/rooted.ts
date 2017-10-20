// asset/loaders/rooted - loader that handles root-relative paths allowing for virtual filesystem roots
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../loader.ts" />

namespace sd.asset.load {
	
	export interface RootedURLLoaderConfig {
		prefix?: string;
		loader?: LoaderInfo | Loader;
	}

	export function RootedURLLoader(config: RootedURLLoaderConfig) {
		const prefix = config.prefix || "";
		assert(prefix.length > 0, "RootedURLLoader: a path prefix must be provided.");
		const loader = config.loader && makeLoader(config.loader);
		assert(loader, "RootedURLLoader: a loader must be provided.");

		return (uri: string, mimeType?: string) =>
			new Promise<Blob>((resolve, reject) => {
				const firstSlash = uri.indexOf("/");
				const rootName = uri.substring(0, firstSlash);
				if (rootName !== prefix) {
					return reject("Not a url in this root");
				}

				const resourcePath = uri.substring(firstSlash + 1);
				resolve(loader!(resourcePath, mimeType));
			});
	}

	registerLoaderClass("rooted", RootedURLLoader);

} // ns sd.asset.loader
