// render/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	import RCT = RenderCommandType;

	export function renderFrame(this: GL1RenderDevice) {
		const gl = this.gl;

		for (const cmd of this.commandList_) {
			switch (cmd.type) {
				case RCT.FrontFace: {
					const frontMode = (cmd.frontFace === FrontFaceWinding.Clockwise) ? GLConst.CW : GLConst.CCW;
					gl.frontFace(frontMode);
					break;
				}
				case RCT.Scissor: {
					if (cmd.width === -1) {
						gl.disable(GLConst.SCISSOR_TEST);
					}
					else {
						gl.scissor(cmd.originX, cmd.originY, cmd.width, cmd.height);
						gl.enable(GLConst.SCISSOR_TEST);
					}
					break;
				}
				case RCT.Viewport: {
					gl.viewport(cmd.originX, cmd.originY, cmd.width, cmd.height);
					gl.depthRange(cmd.nearZ, cmd.farZ);
					break;
				}
				case RCT.TextureWrite: {
					const texData = this.textures_.getByHandle(cmd.textureHandle)!; // assert presence of resource
					gl.bindTexture(texData.target, texData.texture);
					gl.texSubImage2D(texData.target, 0, cmd.x, cmd.y, cmd.width, cmd.height, GLConst.RGBA, GLConst.FLOAT, cmd.pixels);
					break;
				}
				case RCT.FrameBuffer: {
					
					break;
				}
				case RCT.RenderJob: {
					
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
