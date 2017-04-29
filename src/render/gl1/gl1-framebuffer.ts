// render/gl1/framebuffer - WebGL1 implementation of FrameBuffer
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	const fboBugs = {
		mustHaveAColourAtt: undefined as (boolean | undefined)
	};

	function fboMustHaveAColourAttachment(rd: GL1RenderDevice) {
		if (fboBugs.mustHaveAColourAtt === undefined) {
			const gl = rd.gl;
			const fboBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

			const fbo = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

			// -- create and attach depth buffer
			const depthBuf = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuf);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 160, 120);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuf);

			// -- specify empty draw buffer list
			if (rd.extDrawBuffers) {
				rd.extDrawBuffers.drawBuffersWEBGL([gl.NONE]);
			}

			// This bug occurs on macOS in Safari and Chrome, it is due to faulty
			// setup of DRAW and READ buffer bindings in the underlying GL4 context.
			// Bugs have been filed.
			const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			fboBugs.mustHaveAColourAtt = (fbStatus !== gl.FRAMEBUFFER_COMPLETE);

			gl.bindFramebuffer(gl.FRAMEBUFFER, fboBinding);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);

			gl.deleteFramebuffer(fbo);
			gl.deleteRenderbuffer(depthBuf);
		}

		return fboBugs.mustHaveAColourAtt;
	}


	function attachTexture(rd: GL1RenderDevice, glAttachment: number, attachment: AttachmentDescriptor) {
		const gl = rd.gl;
		const texture = attachment.texture;
		const glTex = rd.textures_.find(texture);
		assert(glTex, "FB texture is not yet allocated");
		assert(attachment.level === 0, "WebGL 1 does not allow mapping of texture level > 0");

		let glTarget = gl.TEXTURE_2D;
		if (texture.textureClass === TextureClass.CubeMap) {
			assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
			glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + attachment.layer;
		}

		gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, glTex!, attachment.level);
	}


	export function gl1CreateFrameBuffer(rd: GL1RenderDevice, frameBuffer: FrameBuffer) {
		const gl = rd.gl;
		const fbo = gl.createFramebuffer()!; // FIXME: handle allocation failure
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		// colours
		const drawBuffers = frameBuffer.colourAttachments.map((attachment, attIndex) => {
			const glAttachment = rd.extDrawBuffers ? (rd.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex) : gl.COLOR_ATTACHMENT0;
			attachTexture(rd, glAttachment, attachment);
			return glAttachment;
		});

		// workaround for a bug where a colour attachment MUST be provided
		if ((drawBuffers.length === 0) && fboMustHaveAColourAttachment(rd)) {
			assert(false, "FIXME: handle fbo colour attachment bug");
		}

		if (rd.extDrawBuffers) {
			rd.extDrawBuffers.drawBuffersWEBGL(drawBuffers);
		}

		if (frameBuffer.depthAttachment) {
			assert(frameBuffer.depthAttachment.level === 0);
			assert(frameBuffer.depthAttachment.layer === 0);
		}
		if (frameBuffer.stencilAttachment) {
			assert(frameBuffer.stencilAttachment.level === 0);
			assert(frameBuffer.stencilAttachment.layer === 0);
		}

		if (frameBuffer.depthAttachment && frameBuffer.stencilAttachment && (frameBuffer.depthAttachment === frameBuffer.stencilAttachment)) {
			// combined depth/stencil texture
			assert(image.pixelFormatIsDepthStencilFormat(frameBuffer.depthAttachment.texture.pixelFormat));
			attachTexture(rd, gl.DEPTH_STENCIL_ATTACHMENT, frameBuffer.depthAttachment);
		}
		else {
			if (frameBuffer.depthAttachment) {
				assert(image.pixelFormatIsDepthFormat(frameBuffer.depthAttachment.texture.pixelFormat));
				attachTexture(rd, gl.DEPTH_ATTACHMENT, frameBuffer.depthAttachment);
			}

			if (frameBuffer.stencilAttachment) {
				assert(image.pixelFormatIsStencilFormat(frameBuffer.stencilAttachment.texture.pixelFormat));
				attachTexture(rd, gl.STENCIL_ATTACHMENT, frameBuffer.stencilAttachment);
			}
		}

		// -- beg for approval to the GL gods
		const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status !== gl.FRAMEBUFFER_COMPLETE) {
			assert(false, "FrameBuffer not complete");
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return fbo;
	}

} // ns sd.render.gl1
