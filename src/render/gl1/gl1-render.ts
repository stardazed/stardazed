// render/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	import RCT = RenderCommandType;

	const gl1TypeForPrimitiveType: ReadonlyMap<meshdata.PrimitiveType, number> = new Map<meshdata.PrimitiveType, number>([
		[meshdata.PrimitiveType.Point, GLConst.POINTS],
		[meshdata.PrimitiveType.Line, GLConst.LINES],
		[meshdata.PrimitiveType.LineStrip, GLConst.LINE_STRIP],
		[meshdata.PrimitiveType.Triangle, GLConst.TRIANGLES],
		[meshdata.PrimitiveType.TriangleStrip, GLConst.TRIANGLE_STRIP],
	]);

	const gl1TypeForIndexElementType: ReadonlyMap<meshdata.IndexElementType, number> = new Map<meshdata.IndexElementType, number>([
		[meshdata.IndexElementType.UInt8, GLConst.UNSIGNED_BYTE],
		[meshdata.IndexElementType.UInt16, GLConst.UNSIGNED_SHORT],
		[meshdata.IndexElementType.UInt32, GLConst.UNSIGNED_INT],
	]);

	export function renderFrame(this: GL1RenderDevice) {
		const gl = this.gl;

		for (const cmd of this.commandList_) {
			switch (cmd.type) {
				case RCT.FrontFace: {
					this.state.setFrontFace(cmd.frontFace);
					break;
				}

				case RCT.Scissor: {
					this.state.setScissorRect(cmd.width < 0 ? null : cmd);
					break;
				}

				case RCT.Viewport: {
					this.state.setViewport(cmd);
					break;
				}

				case RCT.TextureWrite: {
					const texData = this.textures_.getByHandle(cmd.textureHandle)!;
					this.state.setTexture(this.state.maxTextureSlot, texData, undefined);
					gl.texSubImage2D(texData.target, 0, cmd.x, cmd.y, cmd.width, cmd.height, GLConst.RGBA, GLConst.FLOAT, cmd.pixels);
					break;
				}

				case RCT.FrameBuffer: {
					const fb = this.frameBuffers_.getByHandle(cmd.frameBufferHandle)!;
					this.state.setFramebuffer(fb);

					// -- clear indicated buffers
					let glClearMask = 0;
					if (cmd.clearMask & ClearMask.Colour) {
						this.state.setClearColour(cmd.clearValues.colour);
						glClearMask |= GLConst.COLOR_BUFFER_BIT;
					}
					if (cmd.clearMask & ClearMask.Depth) {
						this.state.setClearDepth(cmd.clearValues.depth);
						glClearMask |= GLConst.DEPTH_BUFFER_BIT;
					}
					if (cmd.clearMask & ClearMask.Stencil) {
						this.state.setClearStencil(cmd.clearValues.stencil);
						glClearMask |= GLConst.STENCIL_BUFFER_BIT;
					}
					if (glClearMask) {
						gl.clear(glClearMask);
					}
					break;
				}

				case RCT.RenderJob: {
					// apply pipeline state
					this.state.setColourBlending(cmd.pipeline.blending || null);
					if (cmd.pipeline.colourWriteMask) {
						this.state.setColourWriteMask(cmd.pipeline.colourWriteMask);
					}
					this.state.setDepthWrite(cmd.pipeline.depthWrite);
					this.state.setDepthTest(cmd.pipeline.depthTest);
					this.state.setFaceCulling(cmd.pipeline.faceCulling);

					// apply textures and samplers
					const textureRange = cmd.textureHandles.length;
					for (let tx = 0; tx < textureRange; ++tx) {
						const texture = this.textures_.getByHandle(cmd.textureHandles[tx]);
						const sampler = this.samplers_.getByHandle(cmd.samplerHandles[tx]);
						this.state.setTexture(tx, texture, sampler);
					}

					// apply shader state and parameters
					const program = this.shaders_.getByHandle(cmd.pipeline.shader.renderResourceHandle);
					this.state.setProgram(program || null);
					// TODO: cmd.constants

					// issue draw call
					const mesh = this.meshes_.getByHandle(cmd.meshHandle)!;
					const primType = gl1TypeForPrimitiveType.get(cmd.primitiveType)!;
					if (mesh.indexElement !== meshdata.IndexElementType.None) {
						const indexType = gl1TypeForIndexElementType.get(mesh.indexElement)!;
						const offsetBytes = cmd.fromElement * meshdata.indexElementTypeSizeBytes(mesh.indexElement);
						gl.drawElements(primType, cmd.elementCount, indexType, offsetBytes);
					}
					else {
						gl.drawArrays(primType, cmd.fromElement, cmd.elementCount);
					}
					break;
				}

				default: {
					console.warn("GL1: unrecognized render command", cmd);
					break;
				}
			}
		}
	}

} // sd.render.gl1
