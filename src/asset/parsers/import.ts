// asset/parser/import - handle import meta-asset parsing
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset.parser {

	const parseImport: AssetProcessor = (asset: Asset<null, {}>) => {
		asset.item = null;
		return Promise.resolve(asset);
	};

	registerParser("import", parseImport);

} // ns sd.asset.parser
