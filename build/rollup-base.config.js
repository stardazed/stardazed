const resolve = require("rollup-plugin-node-resolve");
const sourcemaps = require("rollup-plugin-sourcemaps");

const packageConfig = (packageJSON, sourceDir, outputDir) => {
	// default to only building ESM output
	const output = [
		{
			file: `${outputDir}/${packageJSON.module}`,
			format: "es",
			sourcemap: true,
			freeze: false
		}
	];

	// enable UMD builds only when the package.json field specifies a module name
	if (packageJSON.umdName) {
		if (! packageJSON.main) {
			throw new Error("Packages specifying an umdName must have the `main` field specified.");
		}
		if (packageJSON.main === packageJSON.module) {
			throw new Error("Packages specifying an umdName must have different `module` and `main` paths.");
		}

		output.push({
			file: `${outputDir}/${packageJSON.main}`,
			format: "umd",
			name: packageJSON.umdName,
			sourcemap: true,
			freeze: false
		});
	}
	else {
		// no UMD name specified, don't allow implicit builds
		if (packageJSON.main !== packageJSON.module) {
			throw new Error("Packages without an umdName must have equal `module` and `main` paths.");
		}
	}

	return {
		input: `${sourceDir}/index.js`,
		output,
		plugins: [
			resolve({ browser: true }),
			sourcemaps(),
		],
		external(id) {
			// do not bundle other stardazed packages in single-package builds
			return id.startsWith("@stardazed/");
		}
	};
};

module.exports = { packageConfig };
