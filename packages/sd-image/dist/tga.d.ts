/**
 * image/builtin - TGA image parser
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ImageFrame } from "./provider";
export declare function loadTGAFrameFromBufferView(view: ArrayBufferView): Promise<ImageFrame>;
