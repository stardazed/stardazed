// render/gl1/state - WebGL1 state management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	/**
	 * The reason this class exists is to avoid making unnecessary calls to GL
	 * whenever possible as GL will dutifully do as you ask and recompile the
	 * GPU state every time, even if nothing changed. Additionally, the WebGL
	 * layer adds overhead as well and querying the GL is defined to be slow.
	 */
	export class GLState {
		public readonly gl: WebGLRenderingContext;
		private frontFace_: FrontFaceWinding;
		private cullFace_: FaceCulling;
		private scissorEnabled_: boolean;
		private scissorBox_: Int32Array;
		private viewportBox_: Int32Array;
		private depthRange_: Float32Array;
		private clearColour_: Float32Array;
		private clearDepth_: number;
		private clearStencil_: number;

		constructor(gl: WebGLRenderingContext) {
			this.gl = gl;
			this.pullGLState();
		}

		pullGLState() {
			const gl = this.gl;

			const glFrontFace = gl.getParameter(GLConst.FRONT_FACE);
			this.frontFace_ = (glFrontFace === GLConst.CW) ? FrontFaceWinding.Clockwise : FrontFaceWinding.CounterClockwise;

			const glCullFaceEnabled = gl.isEnabled(GLConst.CULL_FACE);
			const glCullFaceMode = gl.getParameter(GLConst.CULL_FACE_MODE);
			this.cullFace_ = glCullFaceEnabled ? (glCullFaceMode === GLConst.BACK ? FaceCulling.Back : FaceCulling.Front) : FaceCulling.Disabled;

			this.scissorEnabled_ = gl.isEnabled(GLConst.SCISSOR_TEST);
			this.scissorBox_ = gl.getParameter(GLConst.SCISSOR_BOX);

			this.viewportBox_ = gl.getParameter(GLConst.VIEWPORT);
			this.depthRange_ = gl.getParameter(GLConst.DEPTH_RANGE);

			this.clearColour_ = gl.getParameter(GLConst.COLOR_CLEAR_VALUE);
			this.clearDepth_ = gl.getParameter(GLConst.DEPTH_CLEAR_VALUE);
			this.clearStencil_ = gl.getParameter(GLConst.STENCIL_CLEAR_VALUE);
		}

		setFrontFace(frontFace: FrontFaceWinding) {
			if (frontFace === this.frontFace_) {
				return;
			}
			this.frontFace_ = frontFace;

			const glFrontFace = (frontFace === FrontFaceWinding.Clockwise) ? GLConst.CW : GLConst.CCW;
			this.gl.frontFace(glFrontFace);
		}

		setFaceCulling(faceCulling: FaceCulling) {
			if (faceCulling === this.cullFace_) {
				return;
			}
			const wasDisabled = this.cullFace_ === FaceCulling.Disabled;
			this.cullFace_ = faceCulling;

			if (faceCulling === FaceCulling.Disabled) {
				this.gl.disable(GLConst.CULL_FACE);
			}
			else {
				if (wasDisabled) {
					this.gl.enable(GLConst.CULL_FACE);
				}
				this.gl.cullFace(faceCulling === FaceCulling.Back ? GLConst.BACK : GLConst.FRONT);
			}
		}

		setScissorRect(rect: ScissorRect | null) {
			if (rect === null) {
				if (this.scissorEnabled_) {
					this.gl.disable(GLConst.SCISSOR_TEST);
					this.scissorEnabled_ = false;
				}
			}
			else {
				if (! this.scissorEnabled_) {
					this.gl.enable(GLConst.SCISSOR_TEST);
				}
				this.scissorEnabled_ = true;

				const box = this.scissorBox_;
				if (rect.originX !== box[0] || rect.originY !== box[1] || rect.width !== box[2] || rect.height !== box[3]) {
					vec4.set(this.scissorBox_, rect.originX, rect.originY, rect.width, rect.height);
					this.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);
				}
			}
		}

		setViewport(viewport: Viewport) {
			const box = this.viewportBox_;
			if (viewport.originX !== box[0] || viewport.originY !== box[1] || viewport.width !== box[2] || viewport.height !== box[3]) {
				vec4.set(this.viewportBox_, viewport.originX, viewport.originY, viewport.width, viewport.height);
				this.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
			}
			const range = this.depthRange_;
			if (viewport.nearZ !== range[0] || viewport.farZ !== range[1]) {
				vec2.set(this.depthRange_, viewport.nearZ, viewport.farZ);
				this.gl.depthRange(viewport.nearZ, viewport.farZ);
			}
		}

		setClearColour(rgba: Float4) {
			if (! vec4.exactEquals(rgba, this.clearColour_)) {
				vec4.copy(this.clearColour_, rgba);
				this.gl.clearColor(rgba[0], rgba[1], rgba[2], rgba[3]);
			}
		}

		setClearDepth(value: number) {
			if (value !== this.clearDepth_) {
				this.clearDepth_ = value;
				this.gl.clearDepth(value);
			}
		}

		setClearStencil(value: number) {
			value = value | 0; // force value to be an int
			if (value !== this.clearStencil_) {
				this.clearStencil_ = value;
				this.gl.clearStencil(value);
			}
		}
	}

} // ns sd.render.gl1
