// veclib - unbrella module for glmatrix namespaces
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

export { vec2 } from "./vec2";
export { vec3 } from "./vec3";
export { vec4 } from "./vec4";

export { mat2 } from "./mat2";
export { mat2d } from "./mat2d";
export { mat3 } from "./mat3";
export { mat4 } from "./mat4";
export { mat4simd } from "./mat4-simd";

export { quat } from "./quat";

// pass-through primarray as va submodule
import * as va from "./primarray";
export { va };
