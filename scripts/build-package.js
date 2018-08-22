const readFileSync = require("fs").readFileSync;
const { resolve } = require("url");
const { rollup } = require("rollup");
const typescript = require("typescript");

const { packageConfig } = require("./rollup-base.config");

// globals
const packagesRoot = resolve(__dirname, ".");
const buildRoot = resolve(__dirname, "scripts/");

function packagePath(name) {
	return resolve(packagesRoot, name + "/");
}

function packageBuildTempPath(name) {
	return resolve(buildRoot, `temp/${name}`);
}

function packageJSONPath(name) {
	return resolve(packagesRoot, `${name}/package.json`);
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
			target: typescript.ScriptTarget.ES2017,
			module: typescript.ModuleKind.ES2015,
			moduleResolution: typescript.ModuleResolutionKind.NodeJs,

			rootDir: `${packageDir}/src`,
			outDir: buildDir,
			declarationDir: `${packageDir}/dist`,

			// why do _I_ need to do this?
			lib: (result.config.compilerOptions.lib || []).map(lf => `lib.${lf}.d.ts`)
		}
	};
}

function compile(packageName) {
	const packageDir = packagePath(packageName);
	const realPackageName = packageName.split("/")[1];
	const indexFileName = resolve(packageDir + "/", `src/${realPackageName}.ts`);

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
            console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        }
        else {
            console.error(typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    }

    return !emitResult.emitSkipped;
}

async function roll(packageName) {
	const packageDir = packagePath(packageName);
	const buildDir = packageBuildTempPath(packageName);
	const packageJSON = require(packageJSONPath(packageName));
	const rollupConfig = packageConfig(packageJSON, buildDir, packageDir);

	const globals = {};
	for (const depName in packageJSON.dependencies) {
		if (depName.startsWith("@stardazed/")) {
			const pascal = depName.replace("@stardazed/", "").split("-").map(
				s => s[0].toUpperCase() + s.substr(1)
			).join("");
			globals[depName] = `sd${pascal}`;
		}
	}

	const { output } = rollupConfig;
	delete rollupConfig.output;

	const bundle = await rollup(rollupConfig);
	for (const out of output) {
		if (out.format === "umd") {
			out.globals = globals;
		}
		await bundle.write(out);
	}
}

async function run() {
	const packageList = process.argv.slice(2);
	if (packageList.length !== 1) {
		console.info("Usage: build-package <group-name>/<package-name>");
		return;
	}
	const packageToBuild = packageList[0];

	if (compile(packageToBuild)) {
		await roll(packageToBuild);
	}
	else {
		throw new Error("compilation failed");
	}
}

run().catch(
	err => {
		console.error("Error: " + err.message);
		console.info(err);
		process.exit(1);
	}
);
