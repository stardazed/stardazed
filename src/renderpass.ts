// renderpass - RenderPass objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="renderpass-desc.ts"/>
/// <reference path="pipeline.ts"/>
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
		// private fbo_: FrameBuffer;
		private pipeline_: Pipeline = null;
		// private mesh_: Mesh = null;

		constructor(private rc: RenderContext, private desc_: RenderPassDescriptor/* , private fbo_: FrameBuffer */) {
		}


		setup() {
		}


		teardown() {
		}


		// -- observers
		// frameBuffer() { return this.fbo_; }


		// -- render state
		setPipeline(pipeline: Pipeline) {
		}

		setDepthStencilTest(dst: DepthStencilTest) {
		}


		setFaceCulling(fc: FaceCulling) {
		}

		setFrontFaceWinding(ffw: FrontFaceWinding) {
		}

		setTriangleFillMode(tfm: TriangleFillMode) {
		}

		setViewPort(vp: Viewport) {
		}

		setScissorRect(sc: ScissorRect) {
		}


		setConstantBlendColour(colour4: ArrayOfNumber) {
		}


		// -- drawing
		// setMesh(mesh: Mesh) {
		// }

		drawIndexedPrimitives(startIndex: number, indexCount: number) {
		}

	}	

} // ns sd.render
