// asset/types - WIP - main asset types and functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset {
		guid: string;
		kind: string;
		name?: string;
	}

	let nextAssetID = 1;
	const nextAnonymousAssetGUID = (kind: string, name: string) =>
		`${kind}_${name || "anonymous"}_${nextAssetID++}_${performance.now().toFixed(2)}`;

	export const makeAsset = (kind: string, name?: string, guid?: string): Asset => ({
		guid: guid || nextAnonymousAssetGUID(kind, name || ""),
		kind,
		name
	});

	export const isAsset = (a: any): a is Asset =>
		typeof a === "object" &&
		typeof a.guid === "string" &&
		typeof a.kind === "string" &&
		(a.name === void 0 || typeof a.name === "string");

} // ns sd.asset
