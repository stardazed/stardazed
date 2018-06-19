import { assert } from '@stardazed/core';
import { makePixelDimensions } from '@stardazed/image';

/**
 * render/resource - resource types in the render engine
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * render/sampler - engine-side samplers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeSampler() {
    return {
        renderResourceType: 2 /* Sampler */,
        renderResourceHandle: 0,
        repeatS: 0 /* Repeat */,
        repeatT: 0 /* Repeat */,
        repeatR: 0 /* Repeat */,
        minFilter: 1 /* Linear */,
        magFilter: 1 /* Linear */,
        mipFilter: 2 /* Linear */,
        lodMinClamp: 0,
        lodMaxClamp: 1000,
        maxAnisotropy: 1
    };
}
function makeCubemapSampler(mipmapped) {
    return Object.assign({}, makeSampler(), { repeatS: 2 /* ClampToEdge */, repeatT: 2 /* ClampToEdge */, repeatR: 2 /* ClampToEdge */, mipFilter: mipmapped ? 2 /* Linear */ : 0 /* None */ });
}
function makeLookupTableSampler() {
    return Object.assign({}, makeSampler(), { repeatS: 2 /* ClampToEdge */, repeatT: 2 /* ClampToEdge */, repeatR: 2 /* ClampToEdge */, minFilter: 0 /* Nearest */, magFilter: 0 /* Nearest */, mipFilter: 0 /* None */ });
}

/**
 * render/texture - engine-side textures
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeMipMapRange(baseLevel, numLevels) {
    return { baseLevel, numLevels };
}
function maxMipLevelsForDimension(dim) {
    return 1 + Math.floor(Math.log(dim | 0) / Math.LN2);
}
function makeTexture() {
    return {
        renderResourceType: 1 /* Texture */,
        renderResourceHandle: 0,
        textureClass: 0 /* Plain */,
        pixelFormat: 0 /* None */,
        dim: makePixelDimensions(0, 0),
        mipmapMode: 0 /* Source */
    };
}
function makeTex2D(pixelFormat, width, height, mipmapMode = 0 /* Source */) {
    return {
        renderResourceType: 1 /* Texture */,
        renderResourceHandle: 0,
        textureClass: 0 /* Plain */,
        pixelFormat,
        dim: makePixelDimensions(width, height),
        mipmapMode
    };
}
function makeTex2DFromProvider(provider, mipmapMode = 0 /* Source */) {
    return {
        renderResourceType: 1 /* Texture */,
        renderResourceHandle: 0,
        textureClass: 0 /* Plain */,
        pixelFormat: provider.pixelFormat,
        dim: makePixelDimensions(provider.dim.width, provider.dim.height),
        mipmapMode,
        pixelData: [provider]
    };
}
/*
export function makeTex2DFloatLUT(sourceData: Float32Array, width: number, height: number): Texture {
    return {
        renderResourceType: ResourceType.Texture,
        renderResourceHandle: 0,

        textureClass: TextureClass.Plain,
        pixelFormat: PixelFormat.RGBA32F,
        dim: makePixelDimensions(width, height),
        mipmapMode: MipMapMode.Source,
        pixelData: [providerForSingleBuffer({
            data: sourceData,
            dim: makePixelDimensions(width, height),
            pixelFormat: PixelFormat.RGBA32F
        })]
    };
}
*/
function makeTexCube(pixelFormat, dimension, mipmapMode = 0 /* Source */) {
    return {
        renderResourceType: 1 /* Texture */,
        renderResourceHandle: 0,
        textureClass: 1 /* CubeMap */,
        pixelFormat,
        dim: makePixelDimensions(dimension, dimension),
        mipmapMode
    };
}
function makeTexCubeFromProviders(sources, mipmapMode = 0 /* Source */) {
    assert(sources.length === 6, "Must pass 6 providers for CubeMap texture.");
    return {
        renderResourceType: 1 /* Texture */,
        renderResourceHandle: 0,
        textureClass: 1 /* CubeMap */,
        pixelFormat: sources[0].pixelFormat,
        dim: makePixelDimensions(sources[0].dim.width, sources[0].dim.height),
        mipmapMode,
        pixelData: sources
    };
}

/**
 * render/shader - Shaders and modules
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * render/framebuffer - descriptors and enums related to FrameBuffer objects
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * Utility function to create an [[AttachmentDescriptor]] object.
 * @param texture The [[Texture]] to bind.
 * @param level Optional: mipmap level of texture to bind.
 * @param layer Optional: cube map face or array layer to bind.
 */
function makeAttachmentDescriptor(texture, level, layer) {
    return {
        texture,
        level: level | 0,
        layer: layer | 0
    };
}
/**
 * Makes a [[FrameBuffer]] render resource using a descriptor.
 * @param desc A [[FrameBufferDescriptor]] describing the [[FrameBuffer]] resource to make.
 */
function makeFrameBuffer(desc) {
    assert(desc.colourAttachments.length > 0, "FrameBuffer must specify at least one colour attachment.");
    const { width, height } = desc.colourAttachments[0].texture.dim;
    assert(desc.colourAttachments.every(cd => cd.texture.dim.width === width && cd.texture.dim.height === height));
    return Object.assign({ renderResourceType: 3 /* FrameBuffer */, renderResourceHandle: 0, width, height }, desc);
}

/**
 * render/mesh - engine-side representation of geometry data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeMesh(geom) {
    return Object.assign({ renderResourceType: 4 /* Mesh */, renderResourceHandle: 0 }, geom);
}

/**
 * render/pipeline - shader variant and configuration
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeColourBlending() {
    return {
        rgbBlendOp: 0 /* Add */,
        alphaBlendOp: 0 /* Add */,
        sourceRGBFactor: 1 /* One */,
        sourceAlphaFactor: 1 /* One */,
        destRGBFactor: 0 /* Zero */,
        destAlphaFactor: 0 /* Zero */,
        constantColour: [0, 0, 0, 1]
    };
}
function makeColourWriteMask(red, green, blue, alpha) {
    return {
        red, green, blue, alpha
    };
}

/**
 * render/command-buffer - typing and buildig command buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeScissorRect() {
    return {
        originX: 0,
        originY: 0,
        width: 32768,
        height: 32768
    };
}
function makeViewport() {
    return {
        originX: 0,
        originY: 0,
        width: 0,
        height: 0,
        nearZ: 0,
        farZ: 1
    };
}
const defaultClearColour_ = [0, 0, 0, 1];
class RenderCommandBuffer {
    constructor() {
        this.commands = [];
    }
    getResourceCommand() {
        if (!this.resourceCommand) {
            this.resourceCommand = {
                type: 1 /* Resource */,
                sortKey: 0,
                alloc: [],
                free: []
            };
            this.commands.push(this.resourceCommand);
        }
        return this.resourceCommand;
    }
    allocate(resource) {
        const cmd = this.getResourceCommand();
        cmd.alloc.push(resource);
    }
    free(resource) {
        const cmd = this.getResourceCommand();
        cmd.free.push(resource);
    }
    setFrameBuffer(fb, clearMask, clearValues) {
        this.commands.push({
            type: 2 /* FrameBuffer */,
            sortKey: 1,
            frameBufferHandle: fb ? fb.renderResourceHandle : 0,
            clearMask,
            clearValues: {
                colour: (clearValues && clearValues.colour) ? clearValues.colour : defaultClearColour_,
                depth: (clearValues && (clearValues.depth !== undefined)) ? clearValues.depth : 1.0,
                stencil: (clearValues && (clearValues.stencil !== undefined)) ? clearValues.stencil : 0,
            }
        });
    }
    setScissor(rect) {
        if (rect === null) {
            rect = { originX: -1, originY: -1, width: -1, height: -1 };
        }
        // TODO: else assert >0-ness of all fields
        this.commands.push(Object.assign({ type: 3 /* Scissor */, sortKey: 1 }, rect));
    }
    setViewport(viewport) {
        this.commands.push(Object.assign({ type: 4 /* Viewport */, sortKey: 1 }, viewport));
    }
    setFrontFace(winding) {
        this.commands.push({
            type: 5 /* FrontFace */,
            sortKey: 1,
            frontFace: winding
        });
    }
    textureWrite(texture, layer, offset, dim, pixels) {
        this.commands.push({
            type: 6 /* TextureWrite */,
            sortKey: 1,
            textureHandle: texture.renderResourceHandle,
            layer,
            x: offset.x,
            y: offset.y,
            width: dim.width,
            height: dim.height,
            pixels
        });
    }
    render(job, _normalizedDepth) {
        this.commands.push({
            type: 7 /* RenderJob */,
            sortKey: 1,
            pipeline: job.pipeline,
            meshHandle: job.mesh.renderResourceHandle,
            primitiveType: job.primGroup.type,
            fromElement: job.primGroup.fromElement,
            elementCount: job.primGroup.elementCount,
            textureHandles: job.textures.map(t => t ? t.renderResourceHandle : 0),
            samplerHandles: job.samplers.map(s => s ? s.renderResourceHandle : 0),
            constants: job.constants
        });
    }
}

/**
 * @stardazed/render - render system interface
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { makeSampler, makeCubemapSampler, makeLookupTableSampler, makeMipMapRange, maxMipLevelsForDimension, makeTexture, makeTex2D, makeTex2DFromProvider, makeTexCube, makeTexCubeFromProviders, makeAttachmentDescriptor, makeFrameBuffer, makeMesh, makeColourBlending, makeColourWriteMask, makeScissorRect, makeViewport, RenderCommandBuffer };
//# sourceMappingURL=index.esm.js.map
