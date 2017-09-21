// asset/identifier - complete missing asset identification based on minimal info
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	/**
	 * Extend an AssetLibrary with the capacity to identify and type assets
	 */
	export const identifierPlugin = (lib: AssetLibrary) => {
		const identifierProcessor: AssetProcessor = (asset: Asset) => {
			if (typeof asset.uri === "string") {
				if (typeof asset.mimeType === void 0) {
					asset.mimeType = mimeTypeForURI(asset.uri);
				}

				if (typeof asset.mimeType === "string") {
					asset.mimeType = asset.mimeType.toLowerCase();

					if (asset.kind === void 0) {
						asset.kind = assetKindForMimeType(asset.mimeType);
					}
				}
			}

			if (typeof asset.kind === "string") {
				asset.kind = asset.kind.toLowerCase();
			}

			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = lib.process;
		lib.process = (asset: Asset) => process(asset).then(identifierProcessor);
	};


	const extensionMimeTypeMap = new Map<string, string>();

	export function registerFileExtension(extension: string, mimeType: string) {
		const ext = extension.toLowerCase();
		const mime = mimeType.toLowerCase();
		assert(ext.length > 0, "registerFileExtension: empty file extension provided");
		assert(mime.length > 0, "registerFileExtension: empty mime-type provided");
		extensionMimeTypeMap.set(ext, mime);
	}

	export function mimeTypeForFileExtension(extension: string): string | undefined {
		const ext = extension.toLowerCase().trim();
		return extensionMimeTypeMap.get(ext);
	}

	export function mimeTypeForURI(uri: URL | string): string | undefined {
		const extension = io.fileExtensionOfURL(uri);
		return mimeTypeForFileExtension(extension);
	}

	const mimeTypeAssetKindMap = new Map<string, string>();

	export const mapMimeTypeToAssetKind = (mimeType: string, assetKind: string) => {
		const mime = mimeType.toLowerCase();
		const kind = assetKind.toLowerCase();
		assert(mime.length > 0, "mapMimeTypeToAssetKind: empty mime-type provided");
		assert(kind.length > 0, "mapMimeTypeToAssetKind: empty asset kind provided");
		mimeTypeAssetKindMap.set(mime, kind);
	};

	export const assetKindForMimeType = (mimeType: string) =>
		mimeTypeAssetKindMap.get(mimeType.toLowerCase());	

} // ns sd.asset
