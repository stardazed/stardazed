const path = require("path");
const dtsBuilder = require("dts-builder");

const projectRoot = path.resolve(__dirname);

dtsBuilder.generateBundles([
	{
		name: "sd-core",
		sourceDir: `${projectRoot}/build/`,
		destDir: `${projectRoot}/`,
		externals: [
			// `${projectRoot}/src/ext/external-lib.d.ts`,
			// `${projectRoot}/src/lib/types.d.ts`
		],
	}
]);
