// render/core/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	import RCT = RenderCommandType;

	const gl1TypeForPrimitiveType = makeLUT<geometry.PrimitiveType, number>(
		geometry.PrimitiveType.Point, GLConst.POINTS,
		geometry.PrimitiveType.Line, GLConst.LINES,
		geometry.PrimitiveType.LineStrip, GLConst.LINE_STRIP,
		geometry.PrimitiveType.Triangle, GLConst.TRIANGLES,
		geometry.PrimitiveType.TriangleStrip, GLConst.TRIANGLE_STRIP
	);

	const gl1TypeForIndexElementType = makeLUT<geometry.IndexElementType, number>(
		geometry.IndexElementType.UInt8, GLConst.UNSIGNED_BYTE,
		geometry.IndexElementType.UInt16, GLConst.UNSIGNED_SHORT,
		geometry.IndexElementType.UInt32, GLConst.UNSIGNED_INT
	);

	export function processFrame(this: GL1RenderDevice) {
		const gl = this.gl;

		// use a stable sort algorithm, V8 (Chrome) uses an unstable Array.prototype.sort implementation
		container.stableSort(this.commandList_, (a, b) => a.sortKey - b.sortKey);

		for (const cmd of this.commandList_) {
			switch (cmd.type) {
				case RCT.Resource:
					this.processResourceCommand(cmd);
					break;

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

				case RCT.TextureWrite: {
					const texData = this.textures_.getByHandle(cmd.textureHandle)!;
					this.state.setTexture(this.state.maxTextureSlot, texData, undefined);
					const glFormat = gl1ImageFormatForPixelFormat(this, texData.format);
					if (image.pixelFormatIsCompressed(texData.format)) {
						gl.compressedTexSubImage2D(texData.target, 0, cmd.x, cmd.y, cmd.width, cmd.height, glFormat, cmd.pixels);
					}
					else {
						const glPixelType = gl1PixelDataTypeForPixelFormat(this, texData.format);
						gl.texSubImage2D(texData.target, 0, cmd.x, cmd.y, cmd.width, cmd.height, glFormat, glPixelType, cmd.pixels);
					}
					this.state.setTexture(this.state.maxTextureSlot, undefined, undefined);
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
					const shader = this.shaders_.getByHandle(cmd.pipeline.shader.renderResourceHandle);
					if (shader) {
						this.state.setProgram(shader.program);
						for (const sc of cmd.constants) {
							const constantData = shader.combinedConstants[sc.name];
							if (constantData) {
								switch (constantData.type) {
									case ShaderValueType.Half:
									case ShaderValueType.Float:
										gl.uniform1fv(constantData.uniform, sc.value as Float32Array); break;
									case ShaderValueType.Half2:
									case ShaderValueType.Float2:
										gl.uniform2fv(constantData.uniform, sc.value as Float32Array); break;
									case ShaderValueType.Half3:
									case ShaderValueType.Float3:
										gl.uniform3fv(constantData.uniform, sc.value as Float32Array); break;
									case ShaderValueType.Half4:
									case ShaderValueType.Float4:
										gl.uniform4fv(constantData.uniform, sc.value as Float32Array); break;

									case ShaderValueType.Float2x2: gl.uniformMatrix2fv(constantData.uniform, false, sc.value as Float32Array); break;
									case ShaderValueType.Float3x3: gl.uniformMatrix3fv(constantData.uniform, false, sc.value as Float32Array); break;
									case ShaderValueType.Float4x4: gl.uniformMatrix4fv(constantData.uniform, false, sc.value as Float32Array); break;

									case ShaderValueType.Int: gl.uniform1iv(constantData.uniform, sc.value as Int32Array); break;
									case ShaderValueType.Int2: gl.uniform2iv(constantData.uniform, sc.value as Int32Array); break;
									case ShaderValueType.Int3: gl.uniform3iv(constantData.uniform, sc.value as Int32Array); break;
									case ShaderValueType.Int4: gl.uniform4iv(constantData.uniform, sc.value as Int32Array); break;
									default: break;
								}
							}
						}
					}
					else {
						this.state.setProgram(null);
					}

					// apply mesh
					const mesh = this.meshes_.getByHandle(cmd.meshHandle)!;
					const attrHash = (cmd.pipeline.shader.vertexFunction as GL1VertexFunction).attrHash!;
					let vao = mesh.vaos.get(attrHash);
					if (! vao) {
						vao = createVAOForAttrBinding(this, mesh, cmd.pipeline.shader.vertexFunction.in);
						mesh.vaos.set(attrHash, vao);
					}
					this.extVAO.bindVertexArrayOES(vao);

					// issue draw call
					const primType = gl1TypeForPrimitiveType[cmd.primitiveType];
					if (mesh.indexElement !== geometry.IndexElementType.None) {
						const indexType = gl1TypeForIndexElementType[mesh.indexElement];
						const offsetBytes = cmd.fromElement * geometry.indexElementTypeSizeBytes[mesh.indexElement];
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

		this.commandList_ = [];
	}

} // sd.render.gl1
