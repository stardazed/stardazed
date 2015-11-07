// framebuffer - FrameBuffer objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="framebuffer-desc.ts"/>
/// <reference path="texture.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	function glTargetForCubeMapFace(rc: RenderContext, face: CubeMapFace) {
		return rc.gl.TEXTURE_CUBE_MAP_POSITIVE_X + face;
	}


	export class FrameBuffer {
		private attachmentDesc_: FrameBufferDescriptor;
		private fbo_: WebGLFramebuffer;
		private width_ = 0;
		private height_ = 0;


		private attachTexture(glAttachment: number, attachment: AttachmentDescriptor) {
			var gl = this.rc.gl;

			if (attachment.texture.target() == gl.RENDERBUFFER) {
				assert(attachment.level == 0);
				assert(attachment.layer == 0);

				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachment, gl.RENDERBUFFER, <WebGLRenderbuffer>attachment.texture.resource());
			}
			else {
				var tex = <WebGLTexture>attachment.texture.resource();
				assert(attachment.level < attachment.texture.mipmaps());

				var glTarget = gl.TEXTURE_2D;
				if (attachment.texture.textureClass() == TextureClass.TexCube) {
					assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
					glTarget = glTargetForCubeMapFace(this.rc, attachment.layer);
				}

				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, tex, attachment.level);
			}
		}


		constructor(private rc: RenderContext, desc: FrameBufferDescriptor) {
			var gl = rc.gl;
			var fbo = this.fbo_ = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

			var anyTexture: Texture = null;

			// -- colour
			var drawBuffers = desc.colourAttachments.map((attachment, attIndex) => {
				if (attachment.texture) {
					anyTexture = attachment.texture;
					var glAttachment = rc.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex;
					this.attachTexture(glAttachment, attachment);
					return glAttachment;
				}
				else {
					return gl.NONE;
				}
			});

			// -- setup the draw buffers to mimic the colour attachments
			// -- as this is the wished behaviour in almost all cases (i.e. no NONE assignments)
			rc.extDrawBuffers.drawBuffersWEBGL(drawBuffers);


			// -- depth and/or stencil
			var depthTex = desc.depthAttachment.texture;
			var stencilTex = desc.stencilAttachment.texture;

			if (depthTex) {
				anyTexture = depthTex;
				assert(desc.depthAttachment.level == 0);
				assert(desc.depthAttachment.layer == 0);
			}

			if (stencilTex) {
				anyTexture = stencilTex;
				assert(desc.stencilAttachment.level == 0);
				assert(desc.stencilAttachment.layer == 0);
			}

			if (depthTex && stencilTex && (depthTex == stencilTex)) {
				// -- combined depth/stencil texture
				assert(pixelFormatIsDepthStencilFormat(depthTex.pixelFormat()));

				this.attachTexture(gl.DEPTH_STENCIL_ATTACHMENT, desc.depthAttachment);
			}
			else {
				if (depthTex) {
					assert(pixelFormatIsDepthFormat(depthTex.pixelFormat()));
					this.attachTexture(gl.DEPTH_ATTACHMENT, desc.depthAttachment);
				}

				if (stencilTex) {
					assert(pixelFormatIsStencilFormat(stencilTex.pixelFormat()));
					this.attachTexture(gl.STENCIL_ATTACHMENT, desc.stencilAttachment);
				}
			}


			// -- beg for approval to the GL gods
			var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status != gl.FRAMEBUFFER_COMPLETE) {
				assert(false, "FrameBuffer not complete");
			}
	
			// -- get width and height from one of the textures
			// -- they should all be the same
			if (anyTexture) {
				this.width_ = anyTexture.width();
				this.height_ = anyTexture.height();
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}


		bind() {
			this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, this.fbo_);
		}


		// -- observers
		width() { return this.width_; }
		height() { return this.height_; }
		resource() { return this.fbo_; }


		hasColourAttachment(atIndex: number) {
			assert(atIndex < maxColourAttachments(this.rc));
			return this.attachmentDesc_.colourAttachments[atIndex].texture != null;
		}

		hasDepthAttachment() {
			return this.attachmentDesc_.depthAttachment.texture != null;
		}

		hasStencilAttachment() {
			return this.attachmentDesc_.stencilAttachment.texture != null;
		}


		colourAttachmentTexture(atIndex: number) {
			assert(atIndex < maxColourAttachments(this.rc));
			return this.attachmentDesc_.colourAttachments[atIndex].texture;
		}

		depthAttachmentTexture() {
			return this.attachmentDesc_.depthAttachment.texture;
		}

		stencilAttachmentTexture() {
			return this.attachmentDesc_.stencilAttachment.texture;
		}
	}

} // ns sd.render
