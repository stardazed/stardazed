// gulpfile
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

const fs = require("fs");
const path = require("path");

const gulp = require("gulp");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const wrap = require("gulp-wrap");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");
const merge = require("merge-stream");

const declarationsPath = "build/decls";

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

gulp.task("decls", function() {
	const folders = getFolders(declarationsPath);

	const tasks = folders.map(function(folder) {
		return gulp.src(path.join(declarationsPath, folder, "/*.d.ts"))
			.pipe(concat(folder + ".d.ts"))
			.pipe(wrap("declare module <%= folder %> {\n<%= contents %>}\n", { folder: folder }))
			.pipe(gulp.dest(declarationsPath)) 
	});

   // group all modules into one declaration
	const root = gulp.src(path.join(declarationsPath, "/*.d.ts"))
		.pipe(concat("stardazed-txx.d.ts"))
		.pipe(gulp.dest("dist"));

	return merge(tasks, root);
});

// bundle main site code
gulp.task("default", function() {
	return rollup({
		entry: "build/es5/stardazed-tx.js",
		format: "iife",
		moduleName: "sd",
		plugins: [
			{
				// allow for TS module refs that are relative paths from the tsconfig src
				resolveId: function(importee, importer) {
					if (importee[0] !== "." && importee.indexOf(".") === -1) {
						return __dirname + "/build/es5/" + importee + ".js";
					}
				}
			}
		]
	})
	.pipe(source("stardazed-tx.js"))
	.pipe(gulp.dest("dist"));
});

// auto-roller
gulp.task("watch", function() {
	gulp.watch("build/**/*.js", ["default"]);
});
