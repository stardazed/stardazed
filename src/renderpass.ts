// renderpass - RenderPass objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="renderpass-desc.ts"/>
/// <reference path="pipeline.ts"/>
/// <reference path="framebuffer.ts"/>
/// <reference path="mesh.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

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
		// private mesh_: Mesh = null;

		constructor(private rc: RenderContext, private desc_: RenderPassDescriptor, private frameBuffer_: FrameBuffer) {
			assert(desc_.clearColour.length >= 4);
		}


		setup() {
			var gl = this.rc.gl;

			this.frameBuffer_.bind();

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
			// <-- TODO: unbind mesh vao

			if (this.pipeline_) {
				this.pipeline_.unbind();
				this.pipeline_ = null;
			}

			this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, null);
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

			if (rect.originX > 0 || rect.originY > 0 || rect.width < this.frameBuffer_.width() || rect.height < this.frameBuffer_.height())
				this.rc.gl.enable(this.rc.gl.SCISSOR_TEST);
			else
				this.rc.gl.disable(this.rc.gl.SCISSOR_TEST);

		}


		setConstantBlendColour(colour4: ArrayOfNumber) {
			assert(colour4.length >= 4);
			this.rc.gl.blendColor(colour4[0], colour4[1], colour4[2], colour4[3]);
		}


		// -- drawing
		// setMesh(mesh: Mesh) {
		// }

		drawIndexedPrimitives(startIndex: number, indexCount: number) {
		}

	}	

} // ns sd.render
