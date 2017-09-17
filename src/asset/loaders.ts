// asset/loader - composable loader functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset.loader {

	export type Loader = (dataPath: string, mimeType?: string) => Promise<Blob>;
	export type LoaderClass = (config: any) => Loader;

	const loaderClasses = new Map<string, LoaderClass>();
	export const registerLoaderClass = (type: string, loca: LoaderClass) => {
		assert(! loaderClasses.has(type), `Tried to register duplicate LoaderClass of type "${type}"`);
		loaderClasses.set(type, loca);
	};

	export interface LoaderInfo {
		type: string;
		[key: string]: any;
	}

	export const makeLoader = (info: LoaderInfo) => {
		const loader = loaderClasses.get(info.type);
		if (! loader) {
			throw new Error(`There is no asset loader of type "${info.type}"`);
		}
		return loader(info);
	};

	// --------------------------------------------------------------------

	export interface URLLoaderConfig {
		rootURL?: string;
		disableCache?: boolean;
	}

	/**
	 * A generic loader that takes a root URL and will load assets relative to this
	 * root. This loader will generally be the final loader in a chain.
	 * @param config Configuration for the Loader to create
	 */
	export const URLLoader: LoaderClass = (config: URLLoaderConfig) => {
		let rootURL: URL;
		try {
			rootURL = new URL(config.rootURL || "");
		}
		catch {
			throw new Error(`URLLoader: a valid, absolute rootURL must be provided.`);
		}
		if (config.disableCache !== true && config.disableCache !== false) {
			if (config.disableCache !== void 0) {
				console.warn(`URLLoader: disableCache must be a boolean property, got:`, config.disableCache);
			}
			config.disableCache = false;
		}

		return (dataPath: string, mimeType?: string) => {
			const fullURL = new URL(dataPath, rootURL.href);

			return io.loadFile<Blob>(
				fullURL, {
					mimeType,
					responseType: io.FileLoadType.Blob,
					tryBreakCache: config.disableCache
				}
			);
		};
	};
	registerLoaderClass("absolute-url", URLLoader);

	// --------------------------------------------------------------------

	export interface RelativeURLLoaderConfig {
		relPath?: string;
		disableCache?: boolean;
	}

	/**
	 * Meta-loader that creates an {{URLLoader}} with the root URL being a path relative to the
	 * current site's base URL.
	 * @param config Configuration taking mainly the site-relative path that will be the root URL
	 */
	export const RelativeURLLoader: LoaderClass = (config: RelativeURLLoaderConfig) =>
		URLLoader({
			rootURL: new URL(config.relPath || "", document.baseURI!).href,
			disableCache: config.disableCache
		});
	registerLoaderClass("relative-url", RelativeURLLoader);

	// --------------------------------------------------------------------

	/**
	 * Loads any base64-encoded data URL, always uses mime-type given in the URL
	 * @param _config ignored, this loader has no configuration options
	 */
	export const DataURLLoader: LoaderClass = (_config: {}) =>
		(dataPath: string, mimeType?: string) => new Promise<Blob>((resolve, reject) => {
			if (dataPath.substr(0, 5) !== "data:") {
				return reject("Not a data url");
			}
			const marker = ";base64,";
			const markerIndex = dataPath.indexOf(marker);
			if (markerIndex <= 5) {
				return reject("Not a base64 data url");
			}

			// simply override any given mime-type with the one provided inside the url
			mimeType = dataPath.substring(5, markerIndex);

			// convert the data through the various stages of grief
			const data64 = dataPath.substr(markerIndex + marker.length);
			const dataStr = atob(data64);
			const dataArray = Array.prototype.map.call(dataStr, (_: string, i: number, s: string) => s.charCodeAt(i)) as number[];
			const data = new Uint8Array(dataArray);
			resolve(new Blob([data], { type: mimeType }));
		});
	registerLoaderClass("data-url", DataURLLoader);

	// --------------------------------------------------------------------

	export interface FallbackLoaderConfig {
		loader: Loader;
		fallback?: Loader;
	}

	/**
	 * Tries to load an asset with the main loader and, if that fails, will try it using
	 * the fallback loader, if provided.
	 * @param config A loader function and its optional fallback loader
	 * @internal
	 */
	export const FallbackLoader: LoaderClass = (config: FallbackLoaderConfig) =>
		(path: string, mimeType?: string) =>
			config.loader(path, mimeType).catch(
				err => {
					if (config.fallback) {
						return config.fallback(path, mimeType);
					}
					throw err;
				}
			);

	// --------------------------------------------------------------------

	export interface ChainedLoaderConfig {
		loaders?: LoaderInfo[];
	}

	/**
	 * Creates a chain of {{FallbackLoader}}s, with the first loader being the outermost and
	 * the last being the innermost. Loads start at the outer loader and go down sequentially.
	 * @param config An array of loaders that will be called last to first until one succeeds
	 */
	export const ChainedLoader: LoaderClass = (config: ChainedLoaderConfig) => {
		const loaders = (Array.isArray(config.loaders) ? config.loaders : []).reverse();
		assert(loaders.length > 0, "ChainedLoader: an array of loaders must be provided (min. 1)");

		let prev: Loader | undefined, cur: Loader | undefined;
		return loaders.map(
			loaderInfo => {
				const loader = makeLoader(loaderInfo);
				prev = cur;
				cur = FallbackLoader({ loader, fallback: prev });
				return cur;
			}
		).pop()!;
	};
	registerLoaderClass("chain", ChainedLoader);

	// --------------------------------------------------------------------

	export interface RootedURLLoaderConfig {
		prefix?: string;
		loader?: LoaderInfo;
	}

	export const RootedURLLoader: LoaderClass = (config: RootedURLLoaderConfig) => {
		const prefix = config.prefix || "";
		assert(prefix.length > 0, "RootedURLLoader: a path prefix must be provided.");
		const loader = config.loader && makeLoader(config.loader);
		assert(loader, "RootedURLLoader: a loader must be provided.");

		return (dataPath: string, mimeType?: string) => new Promise<Blob>((resolve, reject) => {
			const firstSlash = dataPath.indexOf("/");
			const rootName = dataPath.substring(0, firstSlash);
			if (rootName !== prefix) {
				return reject("Not a url in this root");
			}

			const resourcePath = dataPath.substring(firstSlash + 1);
			resolve(loader!(resourcePath, mimeType));
		});
	};
	registerLoaderClass("rooted", RootedURLLoader);

} // ns sd.asset.loader
