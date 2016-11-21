// stardazed.ts - main library entry point file
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

export * from "core/util";
export * from "core/array";
export * from "core/numeric";

export * from "core/dom";

export * from "core/deque";
export * from "core/multiarraybuffer";

export * from "core/perftimer";
export * from "core/runloop";

// testing how to approach submodules
import * as input from "input/input";
export { input };
