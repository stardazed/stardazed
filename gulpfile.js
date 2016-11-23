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
		moduleName: "sd"
	})
	.pipe(source("stardazed-tx.js"))
	.pipe(gulp.dest("dist"));
});

// auto-roller
gulp.task("watch", function() {
	gulp.watch("build/**/*.js", ["default"]);
});
