/**
 * geometry-gen/generate - geometry generators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float2, Float3, Float4 } from "@stardazed/core";
import { VertexAttribute, Geometry } from "@stardazed/geometry";
export declare type Vec2AddFn = (u: number, v: number) => void;
export declare type Vec3AddFn = (x: number, y: number, z: number) => void;
export declare type IndexesAddFn = (a: number, b: number, c: number) => void;
export interface MeshGenerator {
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface TransformedMeshGen {
    generator: MeshGenerator;
    rotation?: Float4;
    translation?: Float3;
    scale?: Float3;
}
export declare type MeshGenSource = MeshGenerator | TransformedMeshGen;
export declare function generate(gens: MeshGenSource | MeshGenSource[], attrList?: VertexAttribute[]): Promise<Geometry>;
export declare class Quad implements MeshGenerator {
    private width_;
    private height_;
    constructor(width_?: number, height_?: number);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export declare function genFullscreenQuad(): Promise<Geometry>;
export declare class NDCTriangle implements MeshGenerator {
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export declare function genFullscreenTriangle(): Promise<Geometry>;
export declare type PlaneYGenerator = (x: number, z: number) => number;
export interface PlaneDescriptor {
    width: number;
    depth: number;
    yGen?: PlaneYGenerator;
    rows: number;
    segs: number;
}
export declare class Plane implements MeshGenerator {
    private width_;
    private depth_;
    private rows_;
    private segs_;
    private yGen_;
    constructor(desc: PlaneDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, _normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface BoxDescriptor {
    width: number;
    height: number;
    depth: number;
    inward?: boolean;
    uvRange?: Float2;
    uvOffset?: Float2;
}
export declare function cubeDescriptor(diam: number, inward?: boolean): BoxDescriptor;
export declare class Box implements MeshGenerator {
    private xDiam_;
    private yDiam_;
    private zDiam_;
    private uvRange_;
    private uvOffset_;
    private inward_;
    constructor(desc: BoxDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface RoundedBoxDescriptor {
    width: number;
    height: number;
    depth: number;
    cornerRadius: number;
    cornerSteps: number;
    inward?: boolean;
    uvRange?: Float2;
    uvOffset?: Float2;
}
export declare class RoundedBox implements MeshGenerator {
    private xDiam_;
    private yDiam_;
    private zDiam_;
    private radius_;
    private uvRange_;
    private uvOffset_;
    private inward_;
    constructor(desc: RoundedBoxDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface ConeDescriptor {
    radiusA: number;
    radiusB: number;
    height: number;
    rows: number;
    segs: number;
}
export declare class Cone implements MeshGenerator {
    private radiusA_;
    private radiusB_;
    private height_;
    private rows_;
    private segs_;
    constructor(desc: ConeDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface SphereDescriptor {
    radius: number;
    rows: number;
    segs: number;
    sliceFrom?: number;
    sliceTo?: number;
}
export declare class Sphere implements MeshGenerator {
    private radius_;
    private rows_;
    private segs_;
    private sliceFrom_;
    private sliceTo_;
    constructor(desc: SphereDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
export interface TorusDescriptor {
    minorRadius: number;
    majorRadius: number;
    rows: number;
    segs: number;
    sliceFrom?: number;
    sliceTo?: number;
}
export declare class Torus implements MeshGenerator {
    private minorRadius_;
    private majorRadius_;
    private rows_;
    private segs_;
    private sliceFrom_;
    private sliceTo_;
    constructor(desc: TorusDescriptor);
    readonly vertexCount: number;
    readonly faceCount: number;
    readonly explicitNormals: boolean;
    generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}
