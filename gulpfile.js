// gulpfile
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

const gulp = require("gulp");
const concat = require("gulp-concat");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");
const path = require("path");

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
