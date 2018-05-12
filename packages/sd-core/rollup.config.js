// tslint:disable
// @ts-check

import resolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
// import typescript from "typescript";
// import tsc from "rollup-plugin-typescript2";

export default [{
	input: "build/index.js",
	output: {
		file: "dist/index.js",
		format: "umd",
		name: "sdCore",
		sourcemap: true,
	},
	plugins: [
		resolve({ browser: true }),
		sourcemaps(),
		// tsc({
		// 	typescript: typescript,
		// 	include: ["src/**/*.ts", "src/**/*.tsx"]
		// })
	]
}];
