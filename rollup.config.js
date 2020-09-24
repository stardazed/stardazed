import fs from "fs";
import dts from "rollup-plugin-dts";

const external = id => id.startsWith("stardazed/");
const paths = id => id.startsWith("stardazed/") && `${id.replace("stardazed", "..")}`;

function module(name) {
	return [
		{
			input: `__build/${name}/index.js`,
			output: [{
				file: `${name}/index.js`,
				format: "esm",
				paths
			}],
			plugins: [],
			external
		},
		{
			input: `__build/${name}/index.d.ts`,
			output: [{
				file: `${name}/index.d.ts`,
				format: "esm",
				paths,
				banner: `/// <reference path="../global-types.d.ts" />` + (name === "render" ? `\n/// <reference path="../webgpu.d.ts" />` : "")
			}],
			plugins: [
				dts()
			],
			external
		}
	];
}

fs.copyFileSync("src/global-types.d.ts", "./global-types.d.ts");
fs.copyFileSync("src/webgpu.d.ts", "./webgpu.d.ts");

export default [
	"core",
	"container",
	"vector",
	"geometry",
	"entity",
	"render"
].flatMap(module);
