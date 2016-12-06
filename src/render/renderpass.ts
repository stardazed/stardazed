// render/renderpass - RenderPass objects
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export function runRenderPass(rc: RenderContext, meshMgr: world.MeshManager, rpDesc: RenderPassDescriptor, frameBuffer: FrameBuffer | null, passFunc: (rp: RenderPass) => void) {
		const rp = new RenderPass(rc, meshMgr, rpDesc, frameBuffer);
		rp.setup();
		passFunc(rp);
		rp.teardown();
	}


	function glTypeForIndexElementType(rc: render.RenderContext, iet: meshdata.IndexElementType): number {
		switch (iet) {
			case meshdata.IndexElementType.UInt8: return rc.gl.UNSIGNED_BYTE;
			case meshdata.IndexElementType.UInt16: return rc.gl.UNSIGNED_SHORT;
			case meshdata.IndexElementType.UInt32:
				return rc.ext32bitIndexes ? rc.gl.UNSIGNED_INT : rc.gl.NONE;

			default:
				assert(false, "Invalid IndexElementType");
				return rc.gl.NONE;
	}
		}


	function glTypeForPrimitiveType(rc: render.RenderContext, pt: meshdata.PrimitiveType) {
		switch (pt) {
			case meshdata.PrimitiveType.Point: return rc.gl.POINTS;
			case meshdata.PrimitiveType.Line: return rc.gl.LINES;
			case meshdata.PrimitiveType.LineStrip: return rc.gl.LINE_STRIP;
			case meshdata.PrimitiveType.Triangle: return rc.gl.TRIANGLES;
			case meshdata.PrimitiveType.TriangleStrip: return rc.gl.TRIANGLE_STRIP;

			default:
				assert(false, "Invalid PrimitiveType");
				return rc.gl.NONE;
		}
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
		private pipeline_: Pipeline | null = null;
		private mesh_: world.MeshInstance = 0;
		private viewport_: Viewport | null = null;

		// TEMPORARY: this class will be broken up, so as of now this stuff is all hacky and deprecated
		// with dependencies up the wazoo

		constructor(private rc: RenderContext, private meshMgr_: world.MeshManager, private desc_: RenderPassDescriptor, private frameBuffer_: FrameBuffer | null = null) {
			assert(desc_.clearColour.length >= 4);
		}


		setup() {
			const gl = this.rc.gl;

			if (this.frameBuffer_) {
				this.frameBuffer_.bind();

				// auto-set viewport to FB dimensions (good idea?)
				const port = render.makeViewport();
				port.width = this.frameBuffer_.width;
				port.height = this.frameBuffer_.height;
				this.setViewPort(port);
			}
			else {
				// set viewport to full canvas
				this.setViewPort(render.makeViewport());
			}

			// -- clear indicated buffers
			let glClearMask = 0;
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
			this.setPipeline(null); // will implicitly clear mesh as well

			if (this.frameBuffer_) {
				this.frameBuffer_.unbind();
			}
		}


		// -- observers
		get frameBuffer() { return this.frameBuffer_; }


		// -- render state
		setPipeline(pipeline: Pipeline | null) {
			if (pipeline === this.pipeline_) {
				return;
			}

			if (this.mesh_) {
				if (this.pipeline_) {
					this.meshMgr_.unbind(this.mesh_, this.pipeline_);
				}
				this.mesh_ = 0;
			}
			if (this.pipeline_) {
				this.pipeline_.unbind();
			}

			this.pipeline_ = pipeline;
			if (this.pipeline_) {
				// TODO: validate Pipeline against FrameBuffer
				this.pipeline_.bind();
			}
		}


		setMesh(mesh: world.MeshInstance) {
			if (! this.pipeline_) {
				assert(false, "You must set the Pipeline before setting the Mesh");
				return;
			}

			if (this.mesh_ === mesh) {
				return;
			}

			if (this.mesh_ && ! mesh) {
				// only need to explicitly unbind if there is no replacement mesh
				this.meshMgr_.unbind(this.mesh_, this.pipeline_);
			}
			this.mesh_ = mesh;
			if (this.mesh_) {
				this.meshMgr_.bind(this.mesh_, this.pipeline_);
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
				const mode = (faceCulling == FaceCulling.Back) ? this.rc.gl.BACK : this.rc.gl.FRONT;
				this.rc.gl.cullFace(mode);
			}
		}

		setFrontFaceWinding(winding: FrontFaceWinding) {
			const mode = (winding == FrontFaceWinding.Clockwise) ? this.rc.gl.CW : this.rc.gl.CCW;
			this.rc.gl.frontFace(mode);
		}


		setViewPort(viewport: Viewport) {
			// shortcut for restoring viewport to normal by passing w,h = 0,0
			if (viewport.width == 0 && viewport.height == 0) {
				viewport.width = this.rc.gl.drawingBufferWidth;
				viewport.height = this.rc.gl.drawingBufferHeight;
			}
			this.rc.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
			this.rc.gl.depthRange(viewport.nearZ, viewport.farZ);

			this.viewport_ = viewport;
		}

		viewport(): Viewport | null {
			return this.viewport_;
		}

		setScissorRect(rect: ScissorRect) {
			this.rc.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);

			let renderWidth: number;
			let renderHeight: number;

			if (this.frameBuffer_) {
				renderWidth = this.frameBuffer_.width;
				renderHeight = this.frameBuffer_.height;
			}
			else {
				renderWidth = this.rc.gl.drawingBufferWidth;
				renderHeight = this.rc.gl.drawingBufferHeight;
			}

			if (rect.originX > 0 || rect.originY > 0 || rect.width < renderWidth || rect.height < renderHeight) {
				this.rc.gl.enable(this.rc.gl.SCISSOR_TEST);
			}
			else {
				this.rc.gl.disable(this.rc.gl.SCISSOR_TEST);
			}
		}


		setConstantBlendColour(colour4: Float4) {
			assert(colour4.length >= 4);
			this.rc.gl.blendColor(colour4[0], colour4[1], colour4[2], colour4[3]);
		}


		setTexture(texture: Texture, bindPoint: number) {
			const gl = this.rc.gl;

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
		drawPrimitives(primitiveType: meshdata.PrimitiveType, startElement: number, elementCount: number, instanceCount = 1) {
			const glPrimitiveType = glTypeForPrimitiveType(this.rc, primitiveType);

			if (instanceCount == 1) {
				this.rc.gl.drawArrays(glPrimitiveType, startElement, elementCount);
			}
			else {
				this.rc.extInstancedArrays.drawArraysInstancedANGLE(glPrimitiveType, startElement, elementCount, instanceCount);
			}
		}


		drawIndexedPrimitives(primitiveType: meshdata.PrimitiveType, indexElementType: meshdata.IndexElementType, startElement: number, elementCount: number, instanceCount = 1) {
			const glPrimitiveType = glTypeForPrimitiveType(this.rc, primitiveType);
			const glIndexElementType = glTypeForIndexElementType(this.rc, indexElementType);
			const offsetBytes = startElement * meshdata.indexElementTypeSizeBytes(indexElementType);

			if (instanceCount == 1) {
				this.rc.gl.drawElements(glPrimitiveType, elementCount, glIndexElementType, offsetBytes);
			}
			else {
				this.rc.extInstancedArrays.drawElementsInstancedANGLE(glPrimitiveType, elementCount, glIndexElementType, offsetBytes, instanceCount);
			}
		}
	}

} // ns sd.render
