/**
 * render/device - engine-side view of render constructs
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { RenderCommandBuffer } from "./command-buffer";
export interface RenderDevice {
    readonly name: string;
    readonly drawableWidth: number;
    readonly drawableHeight: number;
    readonly supportsSRGBTextures: boolean;
    readonly supportsArrayTextures: boolean;
    readonly supportsDepthTextures: boolean;
    readonly maxColourAttachments: number;
    dispatch(cmds: RenderCommandBuffer | RenderCommandBuffer[]): void;
    processFrame(): void;
}
