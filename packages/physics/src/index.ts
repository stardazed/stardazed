/**
 * @stardazed/physics - physics simulation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

// The Ammo library is loaded dynamically and then becomes available as a
// global variable. Either the asm.js or the WebAssembly version is loaded
// depending on availability and compatibility.
/// <reference types="@stardazed/ammo" />

export * from "./shapes";
export * from "./physicsworld";
