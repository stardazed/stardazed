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
    drawGroups: LWDrawGroup[];
    colors?: ArrayOfNumber;
}
declare function genColorArrayFromDrawGroups(drawGroups: LWDrawGroup[], materials: MaterialSet): Float32Array;
declare function parseLWObjectSource(text: string): LWObjectData;
declare function loadLWMaterialFile(filePath: string): Promise<MaterialSet>;
declare function loadLWObjectFile(filePath: string): Promise<LWObjectData>;
declare type PositionAddFn = (x: number, y: number, z: number) => void;
declare type FaceAddFn = (a: number, b: number, c: number) => void;
declare type UVAddFn = (u: number, v: number) => void;
declare abstract class MeshGenerator {
    abstract vertexCount(): number;
    abstract faceCount(): number;
    abstract generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    generate(positions: ArrayOfNumber, faces: ArrayOfNumber, uvs?: ArrayOfNumber): void;
}
declare class Sphere extends MeshGenerator {
    private radius_;
    private rows_;
    private segs_;
    private sliceFrom_;
    private sliceTo_;
    hasTopDisc(): boolean;
    hasBottomDisc(): boolean;
    constructor(radius_?: number, rows_?: number, segs_?: number, sliceFrom_?: number, sliceTo_?: number);
    vertexCount(): number;
    faceCount(): number;
    generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
}
