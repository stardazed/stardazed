// renderpass - RenderPass objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="renderpass-desc.ts"/>
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

	}	

} // ns sd.render
