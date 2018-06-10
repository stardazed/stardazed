const fs = require("fs").promises;
const { resolve } = require("url");
const { rollup } = require("rollup");
const { packageConfig } = require("./rollup-base.config");

// globals
const packagesRoot = resolve(__dirname, "packages/");

function packagePath(name) {
	return resolve(packagesRoot, name);
}

function packageJSONPath(name) {
	return resolve(packagesRoot, `${name}/package.json`);
}

async function getLocalPackageNames() {
	// enum local packages
	const items = await fs.readdir(packagesRoot);

	const packages = [];
	for (const name of items) {
		const stat = await fs.stat(packagePath(name));
		if (stat.isDirectory()) {
			try {
				const jsonStat = await fs.stat(packageJSONPath(name));
				if (jsonStat.isFile()) {
					packages.push(name);
				}
			}
			catch { /* ignore */ }
		}
	}

	return packages;
}

async function build(packageName) {
	const packageDir = packagePath(packageName);
	const packageJSON = require(packageJSONPath(packageName));
	const rollupConfig = packageConfig(packageName, packageJSON, packageDir);

	const { output } = rollupConfig;
	delete rollupConfig.output;

	const bundle = await rollup(rollupConfig);
	for (const out of output) {
		await bundle.write(out);
	}
}

async function run() {
	const requestedPackages = process.argv.slice(2);
	if (! requestedPackages.length) {
		console.info("Usage: yarn buildone <package-name>");
		return;
	}

	const packageNames = await getLocalPackageNames();

	for (const name of requestedPackages) {
		if (packageNames.indexOf(name) < 0) {
			throw new Error(`Package not found: ${name}`);
		}
		await build(name);
	}
}

run().catch(
	err => {
		console.error("Error: " + err.message);
	}
);
