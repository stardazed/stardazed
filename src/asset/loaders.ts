// asset/loader - composable loader functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset.loader {

	export type Loader = (path: string, mimeType?: string) => Promise<Blob>;
	export type LoaderClass = (config: any) => Loader;

	const namedLoaderClasses = new Map<string, LoaderClass>();

	export interface URLLoaderConfig {
		rootURL: URL;
		disableCache?: boolean;
	}

	/**
	 * A generic loader that takes a root URL and will load assets relative to this
	 * root. This loader will generally be the final loader in a chain.
	 * @param config Configuration for the Loader to create
	 */
	export const URLLoader = (config: URLLoaderConfig) =>
		(path: string, mimeType?: string) => {
			const fullURL = new URL(path, config.rootURL.href);

			return io.loadFile<Blob>(
				fullURL, {
					mimeType,
					responseType: io.FileLoadType.Blob,
					tryBreakCache: config.disableCache
				}
			);
		};
	namedLoaderClasses.set("URLLoader", URLLoader);


	export interface RelativeURLLoaderConfig {
		relPath: string;
		disableCache?: boolean;
	}

	/**
	 * Meta-loader that creates an {{URLLoader}} with the root URL being a path relative to the
	 * current site's base URL.
	 * @param config Configuration taking mainly the site-relative path that will be the root URL
	 */
	export const RelativeURLLoader = (config: RelativeURLLoaderConfig) =>
		URLLoader({
			rootURL: new URL(config.relPath, document.baseURI!),
			disableCache: config.disableCache
		});
	namedLoaderClasses.set("RelativeURLLoader", RelativeURLLoader);


	/**
	 * Loads any base64-encoded data URL, always uses mime-type given in the URL
	 * @param _config ignored, this loader has no configuration options
	 */
	export const DataURLLoader = (_config: {}) =>
		(path: string, mimeType?: string) => new Promise<Blob>((resolve, reject) => {
			if (path.substr(0, 5) !== "data:") {
				reject("Not a data url");
			}
			const marker = ";base64,";
			const markerIndex = path.indexOf(marker);
			if (markerIndex <= 5) {
				reject("Not a base64 data url");
			}

			// simply override any given mime-type with the one provided inside the url
			mimeType = path.substring(5, markerIndex);

			// convert the data through the various stages of grief
			const data64 = path.substr(markerIndex + marker.length);
			const dataStr = atob(data64);
			const dataArray = Array.prototype.map.call(dataStr, (_: string, i: number, s: string) => s.charCodeAt(i)) as number[];
			const data = new Uint8Array(dataArray);
			resolve(new Blob([data], { type: mimeType }));
		});
	namedLoaderClasses.set("DataURLLoader", DataURLLoader);
		

	// --------------------------------------------------------------------


	export interface FallbackLoaderConfig {
		loader: Loader;
		fallback?: Loader;
	}

	/**
	 * Tries to load an asset with the main loader and, if that fails, will try it using
	 * the fallback loader, if provided.
	 * @param config A loader function and its optional fallback loader
	 */
	export const FallbackLoader = (config: FallbackLoaderConfig) =>
		(path: string, mimeType?: string) =>
			config.loader(path, mimeType).catch(
				err => {
					if (config.fallback) {
						return config.fallback(path, mimeType);
					}
					throw err;
				}
			);
		

	/**
	 * Creates a chain of {{FallbackLoader}}s, with the first loader being the innermost and
	 * the last being the outermost. Loads start at the outer loader and go down sequentially.
	 * @param config An array of loaders that will be called last to first until one succeeds
	 */
	export const ChainedLoader = (config: Loader[]) => {
		assert(config.length, "At least 1 loader must be provided");

		let prev: Loader | undefined, cur: Loader | undefined;
		return config.map(
			loader => (prev = cur, cur = FallbackLoader({ loader, fallback: prev }))
		).pop()!;
	};

	/*
	Example JSON config
	roots: [
		{
			name: "data",
			loaders: [
				{ type: "RelativeURLLoader", path: "data/", caching: "normal" | "reload" },
				{ type: "IndexedDBLoader", db: "cached_data", maxSize: 500 * 1024 * 1024 }
			]
		}
	]
	*/
	
	export interface AssetRootSpec {
		name: string;
		loaders: {
			type: string;
			[key: string]: any;
		}[];
	}

	interface AssetRoot {
		name: string;
		loader: Loader;
	}

	/**
	 * Returns a loader function that will use the first relative part of the provided
	 * path to index into a pre-specified named set of "roots", which are loading
	 * specifications.
	 * @param rootSpecs One or more named root specifications to look for assets
	 */
	export const AssetLoader = (rootSpecs: AssetRootSpec | AssetRootSpec[]): Loader => {
		const roots: { [name: string]: AssetRoot } = {};

		const makeRoot = (spec: AssetRootSpec): AssetRoot => {
			assert(! (spec.name in roots), "Each root must have a unique, case-sensitive name");

			// Resolve the named loader classes and parameters to a list of Loaders
			const loaderClasses = spec.loaders.map(l => namedLoaderClasses.get(l.type)!);
			assert(loaderClasses.every(lc => lc !== undefined), `Could not find all loaderClasses: ${spec.loaders}`);
			const loaders = loaderClasses.map((lc, index) => lc(spec.loaders[index]));
			
			return {
				name: spec.name,
				loader: ChainedLoader(loaders)
			};
		};

		if (! Array.isArray(rootSpecs)) {
			rootSpecs = [rootSpecs];
		}
		assert(rootSpecs.length > 0, "At least 1 AssetRootSpec must be provided");
		for (const spec of rootSpecs) {
			roots[spec.name] = makeRoot(spec);
		}

		return (path: string, mimeType?: string) => {
			// The first slash separates the root name from the file path.
			// The root name must be at least 1 character in length.
			// The file path can be empty.
			// The slash separating the root and path is mandatory.
			// Roots are not sandboxes, you can use .., etc. to escape the root (FIXME?)

			const firstSlash = path.indexOf("/");
			assert(firstSlash > 0, "Path must have a root name and separating slash");

			const rootName = path.substring(0, firstSlash);
			const root = roots[rootName];
			assert(root, `root ${rootName} does not exist`);

			const resourcePath = path.substring(firstSlash + 1);
			return root.loader(resourcePath, mimeType);
		};
	};

} // ns sd.asset
