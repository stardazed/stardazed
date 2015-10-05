/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />
/// <reference path="libzm.d.ts" />
/// <reference path="libzmgame.d.ts" />
declare var gl: WebGLRenderingContext;
interface ZMBasicGLProgram extends WebGLProgram {
    vertexPositionAttribute: number;
    vertexNormalAttribute: number;
    vertexColorAttribute: number;
    vertexUVAttribute: number;
    projMatrixUniform?: WebGLUniformLocation;
    mvMatrixUniform?: WebGLUniformLocation;
    normalMatrixUniform?: WebGLUniformLocation;
    textureUniform?: WebGLUniformLocation;
    timeUniform?: WebGLUniformLocation;
}
declare class TriMesh {
    vertexBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    uvBuffer: WebGLBuffer;
    indexCount: number;
    constructor(vertexArray: ArrayOfNumber, normalArray?: ArrayOfNumber, colorArray?: ArrayOfNumber, uvArray?: ArrayOfNumber);
    draw(program: ZMBasicGLProgram, texture?: WebGLTexture): void;
}
interface Material {
    ambientColor?: ArrayOfNumber;
    diffuseColor?: ArrayOfNumber;
    specularColor?: ArrayOfNumber;
}
declare type MaterialSet = {
    [matName: string]: Material;
};
interface TriangleSoup {
    elementCount: number;
    vertexes: ArrayOfNumber;
    normals?: ArrayOfNumber;
    uvs?: ArrayOfNumber;
}
declare function parseLWMaterialSource(text: string): MaterialSet;
interface LWDrawGroup {
    materialName: string;
    fromIndex: number;
    indexCount: number;
}
interface LWObjectData extends TriangleSoup {
    mtlFileName: string;
    materialGroups: LWDrawGroup[];
}
declare function parseLWObjectSource(text: string): LWObjectData;
declare function loadLWMaterialFile(filePath: string): Promise<MaterialSet>;
declare function loadLWObjectFile(filePath: string): Promise<TriangleSoup>;
