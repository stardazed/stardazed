// render/gl1/state - WebGL1 state management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	class GLState {
		private frontFace_: FrontFaceWinding;
		private cullFace_: FaceCulling;

		constructor(public gl: WebGLRenderingContext) {
			const glFrontFace = gl.getParameter(GLConst.FRONT_FACE);
			this.frontFace_ = (glFrontFace === GLConst.CW) ? FrontFaceWinding.Clockwise : FrontFaceWinding.CounterClockwise;

			const glCullFaceEnabled = gl.isEnabled(GLConst.CULL_FACE);
			const glCullFaceMode = gl.getParameter(GLConst.CULL_FACE_MODE);
			this.cullFace_ = glCullFaceEnabled ? (glCullFaceMode === GLConst.BACK ? FaceCulling.Back : FaceCulling.Front) : FaceCulling.Disabled;
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
		}
	}

} // ns sd.render.gl1
