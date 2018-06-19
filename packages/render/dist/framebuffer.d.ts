/**
 * render/framebuffer - descriptors and enums related to FrameBuffer objects
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { RenderResourceBase } from "./resource";
import { CubeMapFace, Texture } from "./texture";
/**
 * Describes the properties of a [[FrameBuffer]] attachment.
 */
export interface AttachmentDescriptor {
    /**
     * The texture resource that will act as the attachment buffer.
     */
    texture: Texture;
    /**
     * The mipmap level of texture to use.
     * Not supported when using the WebGL 1 renderer.
     */
    level: number;
    /**
     * Either the [[CubeMapFace]] in case of a cube texture or the layer in case of a 2D Array texture. 0 otherwise.
     * Not supported when using the WebGL 1 renderer.
     */
    layer: number | CubeMapFace;
}
/**
 * Utility function to create an [[AttachmentDescriptor]] object.
 * @param texture The [[Texture]] to bind.
 * @param level Optional: mipmap level of texture to bind.
 * @param layer Optional: cube map face or array layer to bind.
 */
export declare function makeAttachmentDescriptor(texture: Texture, level?: number, layer?: number | CubeMapFace): AttachmentDescriptor;
/**
 * A render resource referencing a frame buffer aka render target.
 * A FrameBuffer can have multiple colour attachment, an optional
 * depth attachments and an optional stencil attachment.
 */
export interface FrameBuffer extends RenderResourceBase {
    /**
     * Width in pixels for all attachments
     */
    readonly width: number;
    /**
     * Height in pixels for all attachments
     */
    readonly height: number;
    /**
     * Array of colour attachments, may be empty.
     */
    readonly colourAttachments: ReadonlyArray<AttachmentDescriptor>;
    /**
     * Optional depth attachment.
     */
    readonly depthAttachment?: AttachmentDescriptor;
    /**
     * Optional stencil attachment.
     */
    readonly stencilAttachment?: AttachmentDescriptor;
}
/**
 * Object describing a [[FrameBuffer]].
 */
export interface FrameBufferDescriptor {
    colourAttachments: AttachmentDescriptor[];
    depthAttachment?: AttachmentDescriptor;
    stencilAttachment?: AttachmentDescriptor;
}
/**
 * Makes a [[FrameBuffer]] render resource using a descriptor.
 * @param desc A [[FrameBufferDescriptor]] describing the [[FrameBuffer]] resource to make.
 */
export declare function makeFrameBuffer(desc: FrameBufferDescriptor): FrameBuffer;
