const resolve = require("rollup-plugin-node-resolve");
const sourcemaps = require("rollup-plugin-sourcemaps");
const typescript = require("typescript");
const tsc = require("rollup-plugin-typescript2");

const packageConfig = (name, packageJSON, packageDir) => {
	// default to only building ESM output
	const output = [
		{
			file: `${packageDir}/${packageJSON.module}`,
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
			file: `${packageDir}/${packageJSON.main}`,
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
		input: `${packageDir}/src/index.ts`,
		output,
		plugins: [
			resolve({ browser: true }),
			sourcemaps(),
			tsc({
				typescript,
				tsconfig: `${__dirname}/tsconfig-packages.json`,
				tsconfigOverride: {
					compilerOptions: {
						rootDir: `${packageDir}/src`,
						outDir: `${packageDir}/build`,
						declaration: true,
						declarationDir: `${packageDir}/dist`,
					},
					include: [`${packageDir}/src/**/*.ts`]
				},
				useTsconfigDeclarationDir: true,

				cacheRoot: `./build/temp/${name}`,
				include: [`${packageDir}/src/**/*.ts`],
			}),
		],
		external(id) {
			// do not bundle other stardazed packages in single-package builds
			return id.startsWith("@stardazed/");
		}
	};
};

module.exports = { packageConfig };
