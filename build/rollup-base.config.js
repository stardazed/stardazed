// @ts-check
import resolve from "rollup-plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import typescript from "typescript";
import tsc from "rollup-plugin-typescript2";

export const packageConfig = (name) => {
	return {
		input: "src/index.ts",
		output: [
			{
				file: "dist/index.umd.js",
				format: "umd",
				name,
				sourcemap: true,
			},
			{
				file: "dist/index.esm.js",
				format: "es",
				sourcemap: true,
			},
		],
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
