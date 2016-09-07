// Definitions by: Shane S. Anderson <https://github.com/ander-nz/>
// This file adds 'branding' to the WebGL types to ensure that accidental assignments aren't made.
// For example, var program: WebGLProgram = gl.createShader(...);

interface WebGLObject { readonly __WebGLObject: void; }
interface WebGLBuffer { readonly __WebGLBuffer: void; }
interface WebGLFramebuffer { readonly __WebGLFramebuffer: void; }
interface WebGLProgram { readonly __WebGLProgram: void; }
interface WebGLRenderbuffer { readonly __WebGLRenderbuffer: void; }
interface WebGLShader { readonly __WebGLShader: void; }
interface WebGLTexture { readonly __WebGLTexture: void; }
interface WebGLUniformLocation { readonly __WebGLUniformLocation: void; }
