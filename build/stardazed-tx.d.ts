/// <reference path="../defs/es6-promise.d.ts" />
/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />
declare function assert(cond: any, msg?: string): void;
declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
declare function isArrayLike(t: any): boolean;
declare function seq<T>(t: Array<T>): Array<T>;
declare function seq(t: any): Array<any>;
interface Array<T> {
    find(callback: (element: T, index: number, array: Array<T>) => boolean, thisArg?: any): T;
}
interface HTMLElement {
    matches: (selector: string) => boolean;
}
declare type ElemSelector = string | Object;
declare function $n(sel: string, base?: HTMLElement): HTMLElement[];
declare function $(sel: ElemSelector, base?: HTMLElement): any[];
declare function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement;
declare function show(sel: ElemSelector, disp?: string): void;
declare function hide(sel: ElemSelector): void;
declare function setDisabled(sel: ElemSelector, dis: boolean): void;
declare function enable(sel: ElemSelector): void;
declare function disable(sel: ElemSelector): void;
declare function closest(sourceSel: ElemSelector, sel: string): HTMLElement;
declare function nextElementSibling(elem: HTMLElement): HTMLElement;
declare function on(target: ElemSelector, evt: string, handler: (ev: Event) => any): void;
declare function off(target: ElemSelector, evt: string, handler: (ev: Event) => any): void;
declare function encodeAsQueryString(obj: Object): string;
declare enum FileLoadType {
    ArrayBuffer = 1,
    Blob = 2,
    Document = 3,
    JSON = 4,
    Text = 5,
}
interface FileLoadOptions {
    tryBreakCache?: boolean;
    mimeType?: string;
    responseType?: FileLoadType;
}
declare function loadFile(filePath: string, opts?: FileLoadOptions): Promise<{}>;
declare function intRandom(maximum: number): number;
declare function intRandomRange(minimum: number, maximum: number): number;
declare function deg2rad(deg: number): number;
declare function rad2deg(rad: number): number;
declare function clamp(n: number, min: number, max: number): number;
declare function clamp01(n: number): number;
interface Math {
    sign(n: number): number;
}
declare function loadImage(src: string): Promise<HTMLImageElement>;
declare function imageData(image: HTMLImageElement): ImageData;
declare function loadImageData(src: string): Promise<ImageData>;
declare enum Key {
    UP = 38,
    DOWN = 40,
    LEFT = 37,
    RIGHT = 39,
    SPACE = 32,
    RETURN = 13,
    ESC = 27,
    PAGEUP = 33,
    PAGEDOWN = 34,
    HOME = 36,
    END = 35,
    DELETE = 46,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
}
declare class Keyboard {
    keys: {
        [key: number]: {
            down: boolean;
            when: number;
        };
    };
    constructor();
    down(kc: Key): boolean;
}
declare class TMXLayer {
    width: number;
    height: number;
    tileData: Uint32Array;
    constructor(layerNode: Node);
    tileAt(col: number, row: number): number;
    setTileAt(col: number, row: number, tile: number): void;
    eachTile(callback: (row: number, col: number, tile: number) => void): void;
}
declare class TMXObjectGroup {
    constructor(groupNode: Node);
}
declare type TMXLayerSet = {
    [name: string]: TMXLayer;
};
declare type TMXObjectGroupSet = {
    [name: string]: TMXObjectGroup;
};
declare class TMXData {
    layers: TMXLayerSet;
    objectGroups: TMXObjectGroupSet;
    width: number;
    height: number;
    load(filePath: string): Promise<TMXData>;
}
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
declare namespace sd {
    interface TypedArray {
        BYTES_PER_ELEMENT: number;
        buffer: ArrayBuffer;
        byteLength: number;
        byteOffset: number;
        length: number;
        [index: number]: number;
    }
    interface TypedArrayConstructor {
        new (length: number): TypedArray;
        new (array: ArrayLike<number>): TypedArray;
        new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray;
    }
    interface NumericType {
        min: number;
        max: number;
        signed: boolean;
        byteSize: number;
        arrayType: TypedArrayConstructor;
    }
    const UInt8: NumericType;
    const UInt8Clamped: NumericType;
    const SInt8: NumericType;
    const UInt16: NumericType;
    const SInt16: NumericType;
    const UInt32: NumericType;
    const SInt32: NumericType;
    const Float: NumericType;
    const Double: NumericType;
    function makeTypedArray(nt: NumericType): {
        (length: number): TypedArray;
        (array: ArrayLike<number>): TypedArray;
        (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray;
    };
}
declare namespace sd.mesh {
    const enum VertexField {
        Undefined = 0,
        UInt8x2 = 1,
        UInt8x3 = 2,
        UInt8x4 = 3,
        SInt8x2 = 4,
        SInt8x3 = 5,
        SInt8x4 = 6,
        UInt16x2 = 7,
        UInt16x3 = 8,
        UInt16x4 = 9,
        SInt16x2 = 10,
        SInt16x3 = 11,
        SInt16x4 = 12,
        UInt32 = 13,
        UInt32x2 = 14,
        UInt32x3 = 15,
        UInt32x4 = 16,
        SInt32 = 17,
        SInt32x2 = 18,
        SInt32x3 = 19,
        SInt32x4 = 20,
        Float = 21,
        Floatx2 = 22,
        Floatx3 = 23,
        Floatx4 = 24,
        Norm_UInt8x2 = 129,
        Norm_UInt8x3 = 130,
        Norm_UInt8x4 = 131,
        Norm_SInt8x2 = 132,
        Norm_SInt8x3 = 133,
        Norm_SInt8x4 = 134,
        Norm_UInt16x2 = 135,
        Norm_UInt16x3 = 136,
        Norm_UInt16x4 = 137,
        Norm_SInt16x2 = 138,
        Norm_SInt16x3 = 139,
        Norm_SInt16x4 = 140,
    }
    function vertexFieldElementCount(vf: VertexField): number;
    function vertexFieldNumericType(vf: VertexField): NumericType;
    function vertexFieldElementSizeBytes(vf: VertexField): number;
    function vertexFieldSizeBytes(vf: VertexField): number;
    function vertexFieldIsNormalized(vf: VertexField): boolean;
    const enum VertexAttributeRole {
        Generic = 0,
        Position = 1,
        Normal = 2,
        Tangent = 3,
        Colour = 4,
        UV = 5,
        UVW = 6,
        Index = 7,
    }
    interface VertexAttribute {
        field: VertexField;
        role: VertexAttributeRole;
    }
    function maxVertexAttributes(): number;
    function attrPosition3(): VertexAttribute;
    function attrNormal3(): VertexAttribute;
    function attrColour3(): VertexAttribute;
    function attrUV2(): VertexAttribute;
    function attrTangent4(): VertexAttribute;
    namespace AttrList {
        function Pos3Norm3(): VertexAttribute[];
        function Pos3Norm3Colour3(): VertexAttribute[];
        function Pos3Norm3UV2(): VertexAttribute[];
        function Pos3Norm3Colour3UV2(): VertexAttribute[];
        function Pos3Norm3UV2Tan4(): VertexAttribute[];
    }
    interface PositionedAttribute extends VertexAttribute {
        offset: number;
    }
    function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
    function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
    class VertexLayout {
        private attributeCount_;
        private vertexSizeBytes_;
        private attrs_;
        constructor(attrList: VertexAttribute[]);
        attributeCount(): number;
        vertexSizeBytes(): number;
        bytesRequiredForVertexCount(vertexCount: number): number;
        attrByRole(role: VertexAttributeRole): PositionedAttribute;
        attrByIndex(index: number): PositionedAttribute;
        hasAttributeWithRole(role: VertexAttributeRole): boolean;
    }
    class VertexBuffer {
        private layout_;
        private itemCount_;
        private storage_;
        constructor(attrs: VertexAttribute[] | VertexLayout);
        layout(): VertexLayout;
        strideBytes(): number;
        attributeCount(): number;
        itemCount(): number;
        bufferSizeBytes(): number;
        allocate(itemCount: number): void;
        buffer(): ArrayBuffer;
        hasAttributeWithRole(role: VertexAttributeRole): boolean;
        attrByRole(role: VertexAttributeRole): PositionedAttribute;
        attrByIndex(index: number): PositionedAttribute;
    }
    class VertexBufferAttributeView {
        private vertexBuffer_;
        private stride_;
        private attrOffset_;
        private attrElementCount_;
        private typedViewCtor_;
        private buffer_;
        constructor(vertexBuffer_: VertexBuffer, attr: PositionedAttribute);
        forEach(callback: (item: TypedArray) => void): void;
        item(index: number): TypedArray;
        count(): number;
        vertexBuffer(): VertexBuffer;
    }
    const enum IndexElementType {
        UInt8 = 0,
        UInt16 = 1,
        UInt32 = 2,
    }
    const enum PrimitiveType {
        Point = 0,
        Line = 1,
        LineStrip = 2,
        Triangle = 3,
        TriangleStrip = 4,
    }
    type TypedIndexArray = Uint32Array | Uint16Array | Uint8Array;
    function indexElementTypeSizeBytes(iet: IndexElementType): number;
    function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType;
    class IndexBuffer {
        private primitiveType_;
        private indexElementType_;
        private indexCount_;
        private primitiveCount_;
        private indexElementSizeBytes_;
        private storage_;
        allocate(primitiveType: PrimitiveType, elementType: IndexElementType, primitiveCount: number): void;
        primitiveType(): PrimitiveType;
        indexElementType(): IndexElementType;
        primitiveCount(): number;
        indexCount(): number;
        indexElementSizeBytes(): number;
        bufferSizeBytes(): number;
        buffer(): ArrayBuffer;
        typedBasePtr(baseIndexNr: number, elementCount?: number): TypedIndexArray;
        indexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array): void;
        index(indexNr: number): number;
        setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: Uint32Array): void;
        setIndex(indexNr: number, newValue: number): void;
    }
    class TriangleProxy {
        private data_;
        constructor(data: TypedIndexArray, triangleIndex: number);
        index(index: number): number;
        a(): number;
        b(): number;
        c(): number;
        setIndex(index: number, newValue: number): void;
        setA(newValue: number): void;
        setB(newValue: number): void;
        setC(newValue: number): void;
    }
    class IndexBufferTriangleView {
        private indexBuffer_;
        private fromTriangle_;
        private toTriangle_;
        constructor(indexBuffer_: IndexBuffer, fromTriangle_?: number, toTriangle_?: number);
        forEach(callback: (proxy: TriangleProxy) => void): void;
        item(triangleIndex: number): Uint32Array | Uint16Array | Uint8Array;
        count(): number;
    }
    function calcVertexNormals(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer): void;
    interface PrimitiveGroup {
        fromPrimIx: number;
        primCount: number;
        materialIx: number;
    }
    class MeshData {
        vertexBuffers: Array<VertexBuffer>;
        indexBuffer: IndexBuffer;
        primitiveGroups: Array<PrimitiveGroup>;
        constructor(attrs?: VertexAttribute[]);
        findFirstAttributeWithRole(role: VertexAttributeRole): {
            vertexBuffer: VertexBuffer;
            attr: PositionedAttribute;
        };
        primaryVertexBuffer(): VertexBuffer;
        genVertexNormals(): void;
    }
}
declare namespace sd.mesh.gen {
    type PositionAddFn = (x: number, y: number, z: number) => void;
    type FaceAddFn = (a: number, b: number, c: number) => void;
    type UVAddFn = (u: number, v: number) => void;
    abstract class MeshGenerator {
        abstract vertexCount(): number;
        abstract faceCount(): number;
        abstract generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
        generate(attrList?: VertexAttribute[]): MeshData;
        generateInto(positions: VertexBufferAttributeView, faces: IndexBufferTriangleView, uvs?: VertexBufferAttributeView): void;
    }
    class Sphere extends MeshGenerator {
        private radius_;
        private rows_;
        private segs_;
        private sliceFrom_;
        private sliceTo_;
        constructor(radius_?: number, rows_?: number, segs_?: number, sliceFrom_?: number, sliceTo_?: number);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
}
declare var webkitAudioContext: {
    prototype: AudioContext;
    new (): AudioContext;
};
interface Window {
    webkitAudioContext?: AudioContext;
    AudioContext?: AudioContext;
}
declare class SoundManager {
    context: AudioContext;
    constructor();
    loadSoundFile(filePath: string): Promise<AudioBuffer>;
}
declare namespace sd.scene {
}
