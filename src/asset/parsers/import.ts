// asset/parser/import - handle import meta-asset parsing
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface CacheAccess {
		(kind: "import", name: string): null;
	}
	
	export namespace parse {

		const parseImport: AssetProcessor = async (asset: Asset<null, {}>) => {
			asset.item = null;
		};

		registerParser("import", parseImport);

	} // ns parser

} // ns sd.asset
