// stardazed.ts - main library entry point file
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

export * from "core/util";
export * from "core/array";
export * from "core/numeric";

export * from "container/deque";
export * from "container/multiarraybuffer";

// testing how to approach submodules
import * as input from "input/input";
export { input };
