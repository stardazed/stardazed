// @ts-check
import resolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import typescript from "typescript";
import tsc from "rollup-plugin-typescript2";

export const packageConfig = (packageJSON) => {
	// default to only building ESM output
	const output = [
		{
			file: packageJSON.module,
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
			file: packageJSON.main,
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
		input: "src/index.ts",
		output,
		plugins: [
			resolve({ browser: true }),
			sourcemaps(),
			tsc({
				typescript,
				useTsconfigDeclarationDir: true,
				cacheRoot: "./build",
				include: ["src/**/*.ts"],
			}),
		]
	};
};
