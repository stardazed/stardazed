// asset/library - asset loading, caching, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.asset {

	export class AssetLibrary {
		private roots_ = new Map<string, URL>();

		addRoot(name: string, baseURL: URL) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, baseURL);
		}

		addLocalRoot(name: string, relativePath: string) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, new URL(relativePath, location.href));
		}

		deleteRoot(name: string) {
			assert(this.roots_.has(name), `No asset root named '${name}' exists.`);
			this.roots_.delete(name);
		}

		resolvePath(path: string): URL {
			// The first slash separates the root name from the file path.
			// The root name must be at least 1 character in length.
			// The file path can be empty.
			// The slash separating the root and path is mandatory.
			// Roots are not sandboxes, you can use .., etc. to escape the root (FIXME?)

			const firstSlash = path.indexOf("/");
			assert(firstSlash > 0, "path must have a root name and separating slash");

			const rootName = path.substring(0, firstSlash);
			const rootURL = this.roots_.get(rootName);
			assert(rootURL, `root ${rootName} does not exist`);

			const resourcePath = path.substring(firstSlash + 1);
			return new URL(resourcePath, rootURL!.href);
		}


		load(_path: string) {
			/*
				- resolve path to url
				- if path is present in the cache, then serve resolved Promise to full assetgroup

				- use extension of path to determine mime-type
				- use mime-type to get a loader
				- create asset group
				- invoke loader, passing in asset group and library or some loading context

				- loader fetches file
				- any warnings or errors are logged in the loading context / library?
				- resources are added to the group, both individually and linked together where necessary
			*/
		}
	}

} // ns sd.asset
