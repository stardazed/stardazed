// renderpass - RenderPass objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="renderpass-desc.ts"/>
/// <reference path="pipeline.ts"/>
/// <reference path="framebuffer.ts"/>
/// <reference path="mesh.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	export function runRenderPass(rc: RenderContext, rpDesc: RenderPassDescriptor, frameBuffer: FrameBuffer, passFunc: (rp: RenderPass) => void) {
		var rp = new RenderPass(rc, rpDesc, frameBuffer);
		rp.setup();
		passFunc(rp);
		rp.teardown();
	}


	export class DepthStencilTest {
		private depthTestEnabled_: boolean;
		private depthFunc_: number;

		constructor(private rc: RenderContext, desc: DepthStencilTestDescriptor) {
			this.depthTestEnabled_ = desc.depthTest != DepthTest.Disabled;
			
			switch (desc.depthTest) {
				case DepthTest.AllowAll:
					this.depthFunc_ = rc.gl.ALWAYS; break;
				case DepthTest.DenyAll:
					this.depthFunc_ = rc.gl.NEVER; break;
				case DepthTest.Less:
					this.depthFunc_ = rc.gl.LESS; break;
				case DepthTest.LessOrEqual:
					this.depthFunc_ = rc.gl.LEQUAL; break;
				case DepthTest.Equal:
					this.depthFunc_ = rc.gl.EQUAL; break;
				case DepthTest.NotEqual:
					this.depthFunc_ = rc.gl.NOTEQUAL; break;
				case DepthTest.GreaterOrEqual:
					this.depthFunc_ = rc.gl.GEQUAL; break;
				case DepthTest.Greater:
					this.depthFunc_ = rc.gl.GREATER; break;
				default:
					this.depthFunc_ = rc.gl.NONE; break;
			}
		}


		apply() {
			if (this.depthTestEnabled_) {
				this.rc.gl.enable(this.rc.gl.DEPTH_TEST);
				this.rc.gl.depthFunc(this.depthFunc_);
			}
			else {
				this.rc.gl.disable(this.rc.gl.DEPTH_TEST);
			}
		}
	}


	export class RenderPass {
		private pipeline_: Pipeline = null;
		private mesh_: Mesh = null;

		constructor(private rc: RenderContext, private desc_: RenderPassDescriptor, private frameBuffer_: FrameBuffer = null) {
			assert(desc_.clearColour.length >= 4);
		}


		setup() {
			var gl = this.rc.gl;

			if (this.frameBuffer_) {
				this.frameBuffer_.bind();
			}

			// -- clear indicated buffers
			var glClearMask = 0;
			if (this.desc_.clearMask & ClearMask.Colour) {
				gl.clearColor(this.desc_.clearColour[0], this.desc_.clearColour[1], this.desc_.clearColour[2], this.desc_.clearColour[3]);
				glClearMask |= gl.COLOR_BUFFER_BIT;
			}
			if (this.desc_.clearMask & ClearMask.Depth) {
				gl.clearDepth(this.desc_.clearDepth);
				glClearMask |= gl.DEPTH_BUFFER_BIT;
			}
			if (this.desc_.clearMask & ClearMask.Stencil) {
				gl.clearStencil(this.desc_.clearStencil);
				glClearMask |= gl.STENCIL_BUFFER_BIT;
			}
			if (glClearMask) {
				gl.clear(glClearMask);
			}
		}


		teardown() {
			if (this.mesh_) {
				this.mesh_.unbind();
			}

			if (this.pipeline_) {
				this.pipeline_.unbind();
				this.pipeline_ = null;
			}

			if (this.frameBuffer_) {
				this.frameBuffer_.unbind();
			}
		}


		// -- observers
		frameBuffer() { return this.frameBuffer_; }


		// -- render state
		setPipeline(pipeline: Pipeline) {
			if (pipeline === this.pipeline_)
				return;

			if (this.pipeline_)
				this.pipeline_.unbind();

			this.pipeline_ = pipeline;
			if (this.pipeline_) {
				// FIXME: validate Pipeline against FrameBuffer
				this.pipeline_.bind();
			}
		}

		setDepthStencilTest(dst: DepthStencilTest) {
			dst.apply();
		}


		setFaceCulling(faceCulling: FaceCulling) {
			if (faceCulling == FaceCulling.Disabled) {
				this.rc.gl.disable(this.rc.gl.CULL_FACE);
			}
			else {
				this.rc.gl.enable(this.rc.gl.CULL_FACE);
				var mode = (faceCulling == FaceCulling.Back) ? this.rc.gl.BACK : this.rc.gl.FRONT;
				this.rc.gl.cullFace(mode);
			}
	
		}

		setFrontFaceWinding(winding: FrontFaceWinding) {
			var mode = (winding == FrontFaceWinding.Clockwise) ? this.rc.gl.CW : this.rc.gl.CCW;
			this.rc.gl.frontFace(mode);
		}

		setViewPort(viewport: Viewport) {
			// FIXME: treat width, height == 0 as alias for full viewport
			this.rc.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
			this.rc.gl.depthRange(viewport.nearZ, viewport.farZ);
		}

		setScissorRect(rect: ScissorRect) {
			this.rc.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);

			var renderWidth: number;
			var renderHeight: number;

			if (this.frameBuffer_) {
				renderWidth = this.frameBuffer_.width;
				renderHeight = this.frameBuffer_.height;
			}
			else {
				renderWidth = this.rc.gl.drawingBufferWidth;
				renderWidth = this.rc.gl.drawingBufferHeight;
			}

			if (rect.originX > 0 || rect.originY > 0 || rect.width < renderWidth || rect.height < renderHeight)
				this.rc.gl.enable(this.rc.gl.SCISSOR_TEST);
			else
				this.rc.gl.disable(this.rc.gl.SCISSOR_TEST);
		}


		setConstantBlendColour(colour4: ArrayOfNumber) {
			assert(colour4.length >= 4);
			this.rc.gl.blendColor(colour4[0], colour4[1], colour4[2], colour4[3]);
		}


		setTexture(texture: Texture, bindPoint: number, samplerUniformName: WebGLUniformLocation) {
			var gl = this.rc.gl;

			gl.activeTexture(gl.TEXTURE0 + bindPoint);
			if (texture) {
				assert(! texture.renderTargetOnly);
				texture.bind();
			}
			else {
				// bind a null texture to an arbitrary texture target
				gl.bindTexture(gl.TEXTURE_2D, null);
			}

			// the uniform passed must be part of the currently bound pipeline
			gl.uniform1i(samplerUniformName, bindPoint);
		}


		// -- drawing
		setMesh(mesh: Mesh) {
			this.mesh_ = mesh;
			this.mesh_.bind();
		}


		drawPrimitives(startVertex: number, vertexCount: number, instanceCount = 1) {
			if (instanceCount == 1) {
				this.rc.gl.drawArrays(this.mesh_.glPrimitiveType, startVertex, vertexCount);
			}
			else {
				this.rc.extInstancedArrays.drawArraysInstancedANGLE(this.mesh_.glPrimitiveType, startVertex, vertexCount, instanceCount);
			}
		}


		drawIndexedPrimitives(startIndex: number, indexCount: number, instanceCount = 1) {
			var offsetBytes = startIndex * this.mesh_.indexElementSizeBytes;
			if (instanceCount == 1) {
				this.rc.gl.drawElements(this.mesh_.glPrimitiveType, indexCount, this.mesh_.glIndexElementType, offsetBytes);
			}
			else {
				this.rc.extInstancedArrays.drawElementsInstancedANGLE(this.mesh_.glPrimitiveType, indexCount, this.mesh_.glIndexElementType, offsetBytes, instanceCount);
			}
		}
	}

} // ns sd.render
