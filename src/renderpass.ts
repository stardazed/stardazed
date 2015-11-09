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


	function glDepthFuncForDepthTest(rc: RenderContext, depthTest: DepthTest) {
		switch (depthTest) {
			case DepthTest.AllowAll:
				return rc.gl.ALWAYS;
			case DepthTest.DenyAll:
				return rc.gl.NEVER;
			case DepthTest.Less:
				return rc.gl.LESS;
			case DepthTest.LessOrEqual:
				return rc.gl.LEQUAL;
			case DepthTest.Equal:
				return rc.gl.EQUAL;
			case DepthTest.NotEqual:
				return rc.gl.NOTEQUAL;
			case DepthTest.GreaterOrEqual:
				return rc.gl.GEQUAL;
			case DepthTest.Greater:
				return rc.gl.GREATER;

			default:
				return rc.gl.NONE;
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


		setDepthTest(depthTest: DepthTest) {
			if (depthTest == DepthTest.Disabled) {
				this.rc.gl.disable(this.rc.gl.DEPTH_TEST);
			}
			else {
				this.rc.gl.enable(this.rc.gl.DEPTH_TEST);
				this.rc.gl.depthFunc(glDepthFuncForDepthTest(this.rc, depthTest));
			}
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


		setTexture(texture: Texture, bindPoint: number) {
			var gl = this.rc.gl;

			gl.activeTexture(gl.TEXTURE0 + bindPoint);
			if (texture) {
				assert(! texture.renderTargetOnly);
				texture.bind();
			}
			else {
				// bind a null texture to an arbitrary texture target for the active texture bindpoint
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}


		// -- drawing
		setMesh(mesh: Mesh) {
			this.mesh_ = mesh;
			this.mesh_.bind();
		}


		drawPrimitives(primitiveType: mesh.PrimitiveType, startPrimitive: number, primitiveCount: number, instanceCount = 1) {
			var glPrimitiveType = glTypeForPrimitiveType(this.rc, primitiveType);
			var startVertex = mesh.indexOffsetForPrimitiveCount(primitiveType, startPrimitive);
			var vertexCount = mesh.indexCountForPrimitiveCount(primitiveType, primitiveCount);

			if (instanceCount == 1) {
				this.rc.gl.drawArrays(glPrimitiveType, startVertex, vertexCount);
			}
			else {
				this.rc.extInstancedArrays.drawArraysInstancedANGLE(glPrimitiveType, startVertex, vertexCount, instanceCount);
			}
		}


		drawPrimitiveGroup(primitiveType: mesh.PrimitiveType, primitiveGroup: mesh.PrimitiveGroup, instanceCount = 1) {
			this.drawPrimitives(primitiveType, primitiveGroup.fromPrimIx, primitiveGroup.primCount, instanceCount);
		}


		drawIndexedPrimitives(startPrimitive: number, primitiveCount: number, instanceCount = 1) {
			var glPrimitiveType = this.mesh_.glPrimitiveType;
			var startIndex = mesh.indexOffsetForPrimitiveCount(this.mesh_.primitiveType, startPrimitive);
			var indexCount = mesh.indexCountForPrimitiveCount(this.mesh_.primitiveType, primitiveCount);
			var offsetBytes = startIndex * this.mesh_.indexElementSizeBytes;

			if (instanceCount == 1) {
				this.rc.gl.drawElements(glPrimitiveType, indexCount, this.mesh_.glIndexElementType, offsetBytes);
			}
			else {
				this.rc.extInstancedArrays.drawElementsInstancedANGLE(glPrimitiveType, indexCount, this.mesh_.glIndexElementType, offsetBytes, instanceCount);
			}
		}


		drawIndexedPrimitiveGroup(primitiveGroup: mesh.PrimitiveGroup, instanceCount = 1) {
			this.drawIndexedPrimitives(primitiveGroup.fromPrimIx, primitiveGroup.primCount, instanceCount);
		}
	}

} // ns sd.render
