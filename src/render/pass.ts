// render/pass - EXPERIMENTAL and TEMPORARY
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export class FXAAPass {
		private pipeline_: Pipeline;
		private quad_: world.MeshInstance;
		private texUniform_: WebGLUniformLocation;
		private viewportUniform_: WebGLUniformLocation;

		constructor(rc: RenderContext, meshMgr: world.MeshManager) {
			// -- fullscreen quad
			const quad = meshdata.gen.generate(new meshdata.gen.Quad(2, 2), [meshdata.attrPosition2(), meshdata.attrUV2()]);
			this.quad_ = meshMgr.create({ name: "fxaaQuad", meshData: quad });

			// -- pipeline
			const pld = makePipelineDescriptor();
			pld.colourPixelFormats[0] = PixelFormat.RGBA8;

			pld.vertexShader = makeShader(rc, rc.gl.VERTEX_SHADER, `
				attribute vec2 vertexPos_device;
				void main(){
					gl_Position = vec4(vertexPos_device, 1.0, 1.0);
				}
			`);
			pld.fragmentShader = makeShader(rc, rc.gl.FRAGMENT_SHADER, `
				precision mediump float;

				uniform vec2 viewportSize;
				uniform sampler2D sourceSampler;

				/**
				Basic FXAA implementation based on the code on geeks3d.com with the
				modification that the texture2DLod stuff was removed since it's
				unsupported by WebGL.

				--

				From:
				https://github.com/mitsuhiko/webgl-meincraft

				Copyright (c) 2011 by Armin Ronacher.

				Some rights reserved.

				Redistribution and use in source and binary forms, with or without
				modification, are permitted provided that the following conditions are
				met:

					* Redistributions of source code must retain the above copyright
					  notice, this list of conditions and the following disclaimer.

					* Redistributions in binary form must reproduce the above
					  copyright notice, this list of conditions and the following
					  disclaimer in the documentation and/or other materials provided
					  with the distribution.

					* The names of the contributors may not be used to endorse or
					  promote products derived from this software without specific
					  prior written permission.

				THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
				"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
				LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
				A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
				OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
				SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
				LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
				DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
				THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
				(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
				OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
				*/

				#define FXAA_REDUCE_MIN   (1.0/ 128.0)
				#define FXAA_REDUCE_MUL   (1.0 / 8.0)
				#define FXAA_SPAN_MAX     8.0

				//optimized version for mobile, where dependent 
				//texture reads can be a bottleneck
				vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
							vec2 v_rgbNW, vec2 v_rgbNE, 
							vec2 v_rgbSW, vec2 v_rgbSE, 
							vec2 v_rgbM) {
					vec4 color;
					mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
					vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
					vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
					vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
					vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
					vec4 texColor = texture2D(tex, v_rgbM);
					vec3 rgbM  = texColor.xyz;
					vec3 luma = vec3(0.299, 0.587, 0.114);
					float lumaNW = dot(rgbNW, luma);
					float lumaNE = dot(rgbNE, luma);
					float lumaSW = dot(rgbSW, luma);
					float lumaSE = dot(rgbSE, luma);
					float lumaM  = dot(rgbM,  luma);
					float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
					float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
					
					mediump vec2 dir;
					dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
					dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
					
					float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
										  (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
					
					float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
					dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
							  max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
							  dir * rcpDirMin)) * inverseVP;
					
					vec3 rgbA = 0.5 * (
						texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
						texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
					vec3 rgbB = rgbA * 0.5 + 0.25 * (
						texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
						texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

					float lumaB = dot(rgbB, luma);
					if ((lumaB < lumaMin) || (lumaB > lumaMax))
						color = vec4(rgbA, texColor.a);
					else
						color = vec4(rgbB, texColor.a);
					return color;
				}

				void texcoords(vec2 fragCoord, vec2 resolution,
							out vec2 v_rgbNW, out vec2 v_rgbNE,
							out vec2 v_rgbSW, out vec2 v_rgbSE,
							out vec2 v_rgbM) {
					vec2 inverseVP = 1.0 / resolution.xy;
					v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
					v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
					v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
					v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
					v_rgbM = vec2(fragCoord * inverseVP);
				}

				void main() {
					mediump vec2 v_rgbNW;
					mediump vec2 v_rgbNE;
					mediump vec2 v_rgbSW;
					mediump vec2 v_rgbSE;
					mediump vec2 v_rgbM;

					vec2 fragCoord = gl_FragCoord.xy;
					vec2 uv = vec2(fragCoord / viewportSize);

					texcoords(fragCoord, viewportSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
					gl_FragColor = fxaa(sourceSampler, fragCoord, viewportSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
				}
			`);
			pld.attributeNames.set(meshdata.VertexAttributeRole.Position, "vertexPos_device");

			this.pipeline_ = new Pipeline(rc, pld);
			this.texUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "sourceSampler")!;
			this.viewportUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "viewportSize")!;

			// -- invariant uniforms
			this.pipeline_.bind();
			rc.gl.uniform1i(this.texUniform_, 0);
			this.pipeline_.unbind();
		}

		apply(rc: RenderContext, meshMgr: world.MeshManager, source: Texture) {
			const rpd = makeRenderPassDescriptor();
			rpd.clearMask = ClearMask.None;
			runRenderPass(rc, meshMgr, rpd, null, (rp) => {
				rp.setPipeline(this.pipeline_);
				rp.setTexture(source, 0);
				rp.setMesh(this.quad_);

				rc.gl.uniform2f(this.viewportUniform_, rc.gl.drawingBufferWidth, rc.gl.drawingBufferHeight);

				const primGroup0 = meshMgr.primitiveGroups(this.quad_)[0];
				rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(this.quad_), 0, primGroup0.elementCount);
			});
		}
	}


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
