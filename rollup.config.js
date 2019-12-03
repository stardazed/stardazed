import dts from "rollup-plugin-dts";

const external = id => id.startsWith("stardazed/");
const paths = id => id.startsWith("stardazed/") && `${id.replace("stardazed", "..")}`,

function indexes(module) {
	return [
		{
			input: `build/${module}/index.js`,
			output: [{
				file: `dist/${module}/index.js`,
				format: "esm",
				paths
			}],
			plugins: [],
			external
		},
		{
			input: `build/${module}/index.d.ts`,
			output: [{
				file: `dist/${module}/index.d.ts`,
				format: "esm",
				paths,
			}],
			plugins: [dts()],
			external
		}
	];
}

export default ["core", "container", "vector"].map(indexes).flat();
