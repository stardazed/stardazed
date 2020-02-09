/*
core - common algorithms and structures
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

export * from "./algorithm";
export * from "./buffer";
export * from "./sort";
export * from "./math";
export * from "./numeric";

export type EasingFn = (t: number) => number;
import * as easing from "./easing";
export { easing };
