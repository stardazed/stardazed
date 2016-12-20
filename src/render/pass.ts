// render/pass - 
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export class FilterPass {
		private pipeline_: Pipeline;
		private fbo_: FrameBuffer;
		private quad_: world.MeshInstance;
		private texUniform_: WebGLUniformLocation;
		private viewportUniform_: WebGLUniformLocation;

		constructor(rc: RenderContext, meshMgr: world.MeshManager, width: number, height: number, pixelComponent: FBOPixelComponent, filter: string) {
			// -- fullscreen quad
			const quad = meshdata.gen.generate(new meshdata.gen.Quad(2, 2), [meshdata.attrPosition2(), meshdata.attrUV2()]);
			this.quad_ = meshMgr.create({ name: "filterpassQuad", meshData: quad });

			// -- pipeline
			const pld = makePipelineDescriptor();
			pld.colourPixelFormats[0] = pixelFormatForFBOPixelComponent(pixelComponent);

			pld.vertexShader = makeShader(rc, rc.gl.VERTEX_SHADER, `
				attribute vec2 vertexPos_device;
				varying vec2 vertexUV_intp;
				void main(){
					vertexUV_intp = vertexPos_device * 0.5 + 0.5;
					gl_Position = vec4(vertexPos_device, 0.0, 1.0);
				}
			`);
			pld.fragmentShader = makeShader(rc, rc.gl.FRAGMENT_SHADER, `
				precision highp float;
		 		varying vec2 vertexUV_intp;
				uniform vec2 viewport;
				uniform sampler2D texSampler;
				vec3 get(float x, float y) {
					vec2 off = vec2(x, y);
					return texture2D(texSampler, vertexUV_intp + off / viewport).rgb;
				}
				vec3 get(int x, int y) {
					vec2 off = vec2(x, y);
					return texture2D(texSampler, vertexUV_intp + off / viewport).rgb;
				}
				vec3 filter() {
					${filter}
				}
				void main() {
					gl_FragColor = vec4(filter(), 1.0);
				}
			`);
			pld.attributeNames.set(meshdata.VertexAttributeRole.Position, "vertexPos_device");

			this.pipeline_ = new Pipeline(rc, pld);
			this.texUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "texSampler")!;
			this.viewportUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "viewport")!;

			// -- invariant uniforms
			this.pipeline_.bind();
			rc.gl.uniform1i(this.texUniform_, 0);
			rc.gl.uniform2f(this.viewportUniform_, width, height);
			this.pipeline_.unbind();

			// -- output framebuffer
			this.fbo_ = makeDefaultFrameBuffer(rc, width, height, {
				colourCount: 1,
				pixelComponent: pixelComponent
			});
		}

		apply(rc: RenderContext, meshMgr: world.MeshManager, source: Texture) {
			const rpd = makeRenderPassDescriptor();
			rpd.clearMask = ClearMask.None;
			runRenderPass(rc, meshMgr, rpd, this.fbo_, (rp) => {
				rp.setPipeline(this.pipeline_);
				rp.setTexture(source, 0);
				rp.setMesh(this.quad_);

				const primGroup0 = meshMgr.primitiveGroups(this.quad_)[0];
				rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(this.quad_), 0, primGroup0.elementCount);
			});

		}

		get output() {
			return this.fbo_.colourAttachmentTexture(0)!;
		}
	}


	export function resamplePass(rc: RenderContext, meshMgr: world.MeshManager, dim: number) {
		return new FilterPass(rc, meshMgr, dim, dim, FBOPixelComponent.Float, `return get(0.0, 0.0);`);
	}


	export function boxFilterPass(rc: RenderContext, meshMgr: world.MeshManager, dim: number) {
		return new FilterPass(rc, meshMgr, dim, dim, FBOPixelComponent.Float, `
			vec3 result = vec3(0.0);
			for (int x = -1; x <= 1; x++) {
				for (int y = -1; y <= 1; y++) {
					result += get(x, y);
				}
			}
			return result / 9.0;
		`);
	}

} // ns sd.render
