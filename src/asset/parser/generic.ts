// asset/parser/generic - simple parser/loaders
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parsers.ts" />

namespace sd.asset {

	export namespace parser {
		/**
		 * A parser that just returns the contents of an asset as an ArrayBuffer.
		 */
		export const parseGenericBinary = (resource: RawAsset<{}>) =>
			io.BlobReader.readAsArrayBuffer(resource.blob);

		/**
		 * A parser that just returns the contents of an asset as a a string.
		 */
		export const parseGenericText = (resource: RawAsset<{}>) =>
			io.BlobReader.readAsText(resource.blob);

		/**
		 * A parser that returns the contents of an asset as a JSON object.
		 */
		export const parseJSON = (resource: RawAsset<{}>) =>
			parseGenericText(resource).then(
				text => JSON.parse(text)
			);
	}

	export interface Library {
		loadGenericBinary(sa: SerializedAsset): Promise<ArrayBuffer>;
		loadGenericText(sa: SerializedAsset): Promise<string>;
		loadJSON(sa: SerializedAsset): Promise<any>;
	}

	const GenericLoaders = <T extends Constructor<LibraryBase>>(Base: T) =>
		class extends Base {
			loadGenericBinary(sa: SerializedAsset) {
				return this.loadData(sa).then(resource => parser.parseGenericBinary(resource));
			}

			loadGenericText(sa: SerializedAsset) {
				return this.loadData(sa).then(resource => parser.parseGenericText(resource));
			}

			loadJSON(sa: SerializedAsset) {
				return this.loadData(sa).then(resource => parser.parseJSON(resource));
			}
		};

	addLibraryExtension(GenericLoaders);
	
} // ns sd.asset
