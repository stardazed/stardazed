const fs = require("fs").promises;
const readFileSync = require("fs").readFileSync;
const { resolve } = require("url");
const { rollup } = require("rollup");
const typescript = require("typescript");

const { packageConfig } = require("./rollup-base.config");

// globals
const packagesRoot = resolve(__dirname, "packages/");
const buildRoot = resolve(__dirname, "build/");

function packagePath(name) {
	return resolve(packagesRoot, name);
}

function packageBuildTempPath(name) {
	return resolve(buildRoot, `temp/${name}`);
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

function createTSConfigForPackage(packageName) {
	const packageDir = packagePath(packageName);
	const buildDir = packageBuildTempPath(packageName);

	const result = typescript.readConfigFile(resolve(buildRoot, "tsconfig-packages.json"), path => readFileSync(path, "utf8"));
	if (result.error) {
		console.info(typescript.flattenDiagnosticMessageText(result.error.messageText, "\n"));
		return undefined;
	}

	return {
		...result.config.compilerOptions || {},
		...{
			// this is not handled by readConfigFile for some reason
			target: typescript.ScriptTarget.ES2015,
			module: typescript.ModuleKind.ES2015,
			moduleResolution: typescript.ModuleResolutionKind.NodeJs,

			rootDir: `${packageDir}/src`,
			outDir: buildDir,
			declarationDir: `${packageDir}/dist`,

			// why do _I_ need to do this?
			lib: result.config.compilerOptions.lib.map(lf => `lib.${lf}.d.ts`)
		}
	};
}

function compile(packageName) {
	const packageDir = packagePath(packageName);
	const indexFileName = resolve(packageDir + "/", "src/index.ts");

	const compilerOptions = createTSConfigForPackage(packageName);
	if (! compilerOptions) {
		return false;
	}

	const program = typescript.createProgram([indexFileName], compilerOptions);
	const emitResult = program.emit();

    const allDiagnostics = typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	for (const diagnostic of allDiagnostics) {
        if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			const message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.info(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        }
        else {
            console.info(typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    }

    return !emitResult.emitSkipped;
}

async function roll(packageName) {
	const packageDir = packagePath(packageName);
	const buildDir = packageBuildTempPath(packageName);
	const packageJSON = require(packageJSONPath(packageName));
	const rollupConfig = packageConfig(packageJSON, buildDir, packageDir);

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
		console.info("Usage: yarn buildone <package-name> [<package-name-n> ...]");
		return;
	}
	const packageNames = await getLocalPackageNames();

	for (const name of requestedPackages) {
		if (packageNames.indexOf(name) < 0) {
			console.warn(`Package not found: ${name}`);
		}
		else {
			// compile and roll the package
			console.info(`Building ${name}...`);
			if (compile(name)) {
				await roll(name);
			}
		}
	}
}

run().catch(
	err => {
		console.error("Error: " + err.message);
		console.info(err);
	}
);
