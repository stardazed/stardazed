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
declare namespace sd {
    interface TypedArray {
        BYTES_PER_ELEMENT: number;
        buffer: ArrayBuffer;
        byteLength: number;
        byteOffset: number;
        length: number;
        [index: number]: number;
        set(array: ArrayLike<number>, offset?: number): void;
        subarray(begin: number, end?: number): TypedArray;
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
interface Math {
    sign(n: number): number;
}
declare namespace sd.math {
    function intRandom(maximum: number): number;
    function intRandomRange(minimum: number, maximum: number): number;
    function deg2rad(deg: number): number;
    function rad2deg(rad: number): number;
    function clamp(n: number, min: number, max: number): number;
    function clamp01(n: number): number;
    function roundUpPowerOf2(n: number): number;
    function alignUp(val: number, alignmentPow2: number): number;
    function alignDown(val: number, alignmentPow2: number): number;
    class Rect {
        left: number;
        top: number;
        right: number;
        bottom: number;
        topLeft: Float32Array;
        topRight: Float32Array;
        bottomLeft: Float32Array;
        bottomRight: Float32Array;
        constructor(left: number, top: number, right: number, bottom: number);
        intersectsLineSegment(ptA: ArrayOfNumber, ptB: ArrayOfNumber): boolean;
    }
    interface VectorType {
        elementCount: number;
        byteSize: number;
    }
    class Vec2 {
        static zero: Float32Array;
        static one: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    class Vec3 {
        static zero: Float32Array;
        static one: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    class Vec4 {
        static zero: Float32Array;
        static one: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    class Quat {
        static identity: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    class Mat3 {
        static identity: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    class Mat4 {
        static identity: Float32Array;
        static elementCount: number;
        static byteSize: number;
    }
    function vectorArrayItem(array: TypedArray, type: VectorType, index: number): TypedArray;
}
interface ArrayBufferConstructor {
    transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}
declare namespace sd.container {
    class Deque<T> {
        private blocks_;
        private headBlock_;
        private headIndex_;
        private tailBlock_;
        private tailIndex_;
        private count_;
        private blockCapacity;
        private newBlock();
        private headBlock();
        private tailBlock();
        constructor();
        append(t: T): void;
        prepend(t: T): void;
        popFront(): void;
        popBack(): void;
        clear(): void;
        count(): number;
        empty(): boolean;
        front(): T;
        back(): T;
    }
    interface MABField {
        type: NumericType;
        count: number;
    }
    const enum InvalidatePointers {
        No = 0,
        Yes = 1,
    }
    class MultiArrayBuffer {
        private fields_;
        private capacity_;
        private count_;
        private elementSumSize_;
        private data_;
        constructor(initialCapacity: number, fields: MABField[]);
        capacity(): number;
        count(): number;
        backIndex(): number;
        private fieldArrayView(f, buffer, itemCount);
        reserve(newCapacity: number): InvalidatePointers;
        clear(): void;
        resize(newCount: number): InvalidatePointers;
        extend(): InvalidatePointers;
        indexedFieldView(index: number): TypedArray;
    }
}
declare function loadImage(src: string): Promise<HTMLImageElement>;
declare function imageData(image: HTMLImageElement): ImageData;
declare function loadImageData(src: string): Promise<ImageData>;
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
declare namespace sd.io {
    enum Key {
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
    class Keyboard {
        keys: {
            [key: number]: {
                down: boolean;
                when: number;
            };
        };
        constructor();
        down(kc: Key): boolean;
    }
}
declare namespace sd.world {
    class Instance<Component> {
        ref: number;
        private __C;
        constructor(ref: number);
        equals(other: Instance<Component>): boolean;
        valid(): boolean;
    }
    class Entity {
        private static minFreedBuildup;
        private static indexBits;
        private static generationBits;
        private static indexMask;
        private static generationMask;
        id: number;
        constructor(index: number, gen: number);
        index(): number;
        generation(): number;
        equals(other: Entity): boolean;
        valid(): boolean;
    }
    class EntityManager {
        private generation_;
        private genCount_;
        private freedIndices_;
        private minFreedBuildup;
        private indexBits;
        private generationBits;
        private indexMask;
        private generationMask;
        constructor();
        private appendGeneration();
        create(): Entity;
        alive(ent: Entity): boolean;
        destroy(ent: Entity): void;
    }
    type TransformInstance = Instance<TransformManager>;
    interface TransformDescriptor {
        position: ArrayOfNumber;
        rotation: ArrayOfNumber;
        scale: ArrayOfNumber;
    }
    class TransformManager {
        private instanceData_;
        private parentBase_;
        private positionBase_;
        private rotationBase_;
        private scaleBase_;
        private modelMatrixBase_;
        static root: Instance<TransformManager>;
        constructor();
        rebase(): void;
        count(): number;
        assign(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
        assign(linkedEntity: Entity, desc: TransformDescriptor, parent?: TransformInstance): TransformInstance;
        parent(h: TransformInstance): TransformInstance;
        position(h: TransformInstance): TypedArray;
        rotation(h: TransformInstance): TypedArray;
        scale(h: TransformInstance): TypedArray;
        modelMatrix(h: TransformInstance): TypedArray;
        setParent(h: TransformInstance, newParent: TransformInstance): void;
        setPosition(h: TransformInstance, newPosition: ArrayOfNumber): void;
        setRotation(h: TransformInstance, newRotation: ArrayOfNumber): void;
        setPositionAndRotation(h: TransformInstance, newPosition: ArrayOfNumber, newRotation: ArrayOfNumber): void;
        setScale(h: TransformInstance, newScale: ArrayOfNumber): void;
        forEntity(ent: Entity): TransformInstance;
    }
}
declare namespace sd.model {
    const enum MaterialFlags {
        albedoAlphaIsTranslucency = 1,
        albedoAlphaIsGloss = 2,
        normalAlphaIsHeight = 4,
    }
    interface MaterialDescriptor {
        mainColour: ArrayOfNumber;
        specularColour: ArrayOfNumber;
        specularExponent: number;
        textureScale: ArrayOfNumber;
        textureOffset: ArrayOfNumber;
        flags: MaterialFlags;
        albedoMap: WebGLTexture;
        normalMap: WebGLTexture;
    }
    type MaterialIndex = world.Instance<MaterialManager>;
    class MaterialManager {
        private instanceData_;
        private albedoMaps_;
        private normalMaps_;
        constructor();
        append(desc: MaterialDescriptor): MaterialIndex;
        destroy(index: MaterialIndex): void;
        copyDescriptor(index: MaterialIndex): MaterialDescriptor;
    }
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
        private attr_;
        private firstItem_;
        private stride_;
        private attrOffset_;
        private attrElementCount_;
        private typedViewCtor_;
        private buffer_;
        private viewItemCount_;
        constructor(vertexBuffer_: VertexBuffer, attr_: PositionedAttribute, firstItem_?: number, itemCount?: number);
        forEach(callback: (item: TypedArray) => void): void;
        item(index: number): TypedArray;
        count(): number;
        vertexBuffer(): VertexBuffer;
        subView(fromItem: number, subItemCount: number): VertexBufferAttributeView;
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
declare namespace sd.mesh {
    function scale(mesh: MeshData, scale: ArrayOfNumber): void;
    function translate(mesh: MeshData, globalDelta: ArrayOfNumber): void;
    function rotate(mesh: MeshData, rotation: ArrayOfNumber): void;
    function transform(mesh: MeshData, rotate?: ArrayOfNumber, translate?: ArrayOfNumber, scale?: ArrayOfNumber): void;
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
    interface TransformedMeshDescriptor {
        generator: MeshGenerator;
        rotation?: ArrayOfNumber;
        translation?: ArrayOfNumber;
        scale?: ArrayOfNumber;
    }
    class Composite extends MeshGenerator {
        private parts_;
        private totalVertexes_;
        private totalFaces_;
        constructor(parts_: TransformedMeshDescriptor[]);
        vertexCount(): number;
        faceCount(): number;
        generateInto(positions: VertexBufferAttributeView, faces: IndexBufferTriangleView, uvs?: VertexBufferAttributeView): void;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
    type PlaneYGenerator = (x: number, z: number) => number;
    interface PlaneDescriptor {
        width: number;
        depth: number;
        yGen?: PlaneYGenerator;
        rows: number;
        segs: number;
    }
    class Plane extends MeshGenerator {
        private width_;
        private depth_;
        private rows_;
        private segs_;
        private yGen_;
        constructor(desc: PlaneDescriptor);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
    interface BoxDescriptor {
        width: number;
        height: number;
        depth: number;
    }
    function cubeDescriptor(diam: number): BoxDescriptor;
    class Box extends MeshGenerator {
        private xDiam_;
        private yDiam_;
        private zDiam_;
        constructor(desc: BoxDescriptor);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
    interface ConeDescriptor {
        radiusA: number;
        radiusB: number;
        height: number;
        rows: number;
        segs: number;
    }
    class Cone extends MeshGenerator {
        private radiusA_;
        private radiusB_;
        private height_;
        private rows_;
        private segs_;
        constructor(desc: ConeDescriptor);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
    interface SphereDescriptor {
        radius: number;
        rows: number;
        segs: number;
        sliceFrom?: number;
        sliceTo?: number;
    }
    class Sphere extends MeshGenerator {
        private radius_;
        private rows_;
        private segs_;
        private sliceFrom_;
        private sliceTo_;
        constructor(desc: SphereDescriptor);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
    interface TorusDescriptor {
        minorRadius: number;
        majorRadius: number;
        rows: number;
        segs: number;
        sliceFrom?: number;
        sliceTo?: number;
    }
    class Torus extends MeshGenerator {
        private minorRadius_;
        private majorRadius_;
        private rows_;
        private segs_;
        private sliceFrom_;
        private sliceTo_;
        constructor(desc: TorusDescriptor);
        vertexCount(): number;
        faceCount(): number;
        generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;
    }
}
declare namespace sd.mesh {
    interface Material {
        ambientColor?: ArrayOfNumber;
        diffuseColor?: ArrayOfNumber;
        specularColor?: ArrayOfNumber;
    }
    type MaterialSet = {
        [matName: string]: Material;
    };
    interface LWDrawGroup {
        materialName: string;
        fromIndex: number;
        indexCount: number;
    }
    interface LWMeshData {
        mtlFileName: string;
        mesh: MeshData;
        materials: MaterialSet;
        drawGroups: LWDrawGroup[];
    }
    function loadLWObjectFile(filePath: string): Promise<LWMeshData>;
}
declare namespace sd.render {
    const enum PixelFormat {
        None = 0,
        Alpha = 1,
        RGB8 = 2,
        RGBA8 = 3,
        RGB_5_6_5 = 4,
        RGBA_4_4_4_4 = 5,
        RGBA_5_5_5_1 = 6,
        RGB32F = 7,
        RGBA32F = 8,
        DXT1 = 9,
        DXT3 = 10,
        DXT5 = 11,
        Depth16I = 12,
        Depth32I = 13,
        Depth32F = 14,
        DepthShadow = 14,
        Stencil8 = 15,
        Depth24_Stencil8 = 16,
    }
    interface PixelCoordinate {
        x: number;
        y: number;
    }
    interface PixelDimensions {
        width: number;
        height: number;
    }
    function pixelFormatIsCompressed(format: PixelFormat): boolean;
    function pixelFormatIsDepthFormat(format: PixelFormat): boolean;
    function pixelFormatIsStencilFormat(format: PixelFormat): boolean;
    function pixelFormatIsDepthStencilFormat(format: PixelFormat): boolean;
    function pixelFormatBytesPerElement(format: PixelFormat): number;
    function makePixelCoordinate(x: number, y: number): PixelCoordinate;
    function makePixelDimensions(width: number, height: number): {
        width: number;
        height: number;
    };
}
declare namespace sd.render {
    const enum BlendOperation {
        Add = 0,
        Subtract = 1,
        ReverseSubtract = 2,
        Min = 3,
        Max = 4,
    }
    const enum BlendFactor {
        Zero = 0,
        One = 1,
        SourceColour = 2,
        OneMinusSourceColour = 3,
        DestColour = 4,
        OneMinusDestColour = 5,
        SourceAlpha = 6,
        OneMinusSourceAlpha = 7,
        SourceAlphaSaturated = 8,
        DestAlpha = 9,
        OneMinusDestAlpha = 10,
        ConstantColour = 11,
        OneMinusConstantColour = 12,
        ConstantAlpha = 13,
        OneMinusConstantAlpha = 14,
    }
    interface ColourBlendingDescriptor {
        enabled: boolean;
        rgbBlendOp: BlendOperation;
        alphaBlendOp: BlendOperation;
        sourceRGBFactor: BlendFactor;
        sourceAlphaFactor: BlendFactor;
        destRGBFactor: BlendFactor;
        destAlphaFactor: BlendFactor;
    }
    interface ColourWriteMask {
        red: boolean;
        green: boolean;
        blue: boolean;
        alpha: boolean;
    }
    interface PipelineColourAttachmentDescriptor {
        pixelFormat: PixelFormat;
        writeMask: ColourWriteMask;
        blending: ColourBlendingDescriptor;
    }
    interface PipelineDescriptor {
        colourAttachments: PipelineColourAttachmentDescriptor[];
        depthPixelFormat: PixelFormat;
        stencilPixelFormat: PixelFormat;
        vertexShader: WebGLShader;
        fragmentShader: WebGLShader;
    }
    function makeColourBlendingDescriptor(): ColourBlendingDescriptor;
    function makeColourWriteMask(): ColourWriteMask;
    function makePipelineColourAttachmentDescriptor(): PipelineColourAttachmentDescriptor;
    function makePipelineDescriptor(): PipelineDescriptor;
}
declare namespace sd.render {
    interface RenderContext {
        canvas: HTMLCanvasElement;
        gl: WebGLRenderingContext;
        extDepthTexture: WebGLDepthTexture;
        extS3TC: WebGLCompressedTextureS3TC;
        extMinMax: EXTBlendMinMax;
        extTexAnisotropy: EXTTextureFilterAnisotropic;
    }
    function makeRenderContext(canvas: HTMLCanvasElement): RenderContext;
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
declare namespace sd.model {
    interface StandardGLProgram extends WebGLProgram {
        vertexPositionAttribute: number;
        vertexNormalAttribute: number;
        vertexUVAttribute?: number;
        vertexColorAttribute?: number;
        mvMatrixUniform?: WebGLUniformLocation;
        mvpMatrixUniform?: WebGLUniformLocation;
        normalMatrixUniform?: WebGLUniformLocation;
        lightNormalMatrixUniform?: WebGLUniformLocation;
        ambientSunFactorUniform?: WebGLUniformLocation;
        textureUniform?: WebGLUniformLocation;
    }
    class StandardShader {
        private gl_;
        private materialMgr_;
        constructor(gl_: WebGLRenderingContext, materialMgr_: MaterialManager);
        private makeShader(type, sourceText);
        programForFeatures(feat: number): StandardGLProgram;
        vertexShaderSource(feat: number): string;
        fragmentShaderSource(feat: number): string;
    }
}
declare namespace sd.render {
    const enum TextureClass {
        Tex2D = 0,
        TexCube = 1,
    }
    const enum TextureUsageHint {
        Normal = 0,
        RenderTargetOnly = 1,
    }
    const enum UseMipMaps {
        No = 0,
        Yes = 1,
    }
    const enum CubeMapFace {
        PosX = 0,
        NegX = 1,
        PosY = 2,
        NegY = 3,
        PosZ = 4,
        NegZ = 5,
    }
    interface MipMapRange {
        baseLevel: number;
        numLevels: number;
    }
    const enum TextureRepeatMode {
        Repeat = 0,
        MirroredRepeat = 1,
        ClampToEdge = 2,
        ClampToConstColour = 3,
    }
    const enum TextureSizingFilter {
        Nearest = 0,
        Linear = 1,
    }
    const enum TextureMipFilter {
        None = 0,
        Nearest = 1,
        Linear = 2,
    }
    interface SamplerDescriptor {
        repeatS: TextureRepeatMode;
        repeatT: TextureRepeatMode;
        minFilter: TextureSizingFilter;
        magFilter: TextureSizingFilter;
        mipFilter: TextureMipFilter;
        maxAnisotropy: number;
    }
    interface TextureDescriptor {
        textureClass: TextureClass;
        pixelFormat: PixelFormat;
        usageHint: TextureUsageHint;
        sampling: SamplerDescriptor;
        dim: PixelDimensions;
        mipmaps: number;
    }
    function makeMipMapRange(baseLevel: number, numLevels: number): MipMapRange;
    function makeSamplerDescriptor(): SamplerDescriptor;
    function maxMipLevelsForDimension(dim: number): number;
    function makeTexDesc2D(pixelFormat: PixelFormat, width: number, height: number, mipmapped: UseMipMaps): TextureDescriptor;
    function makeTexDescCube(pixelFormat: PixelFormat, dimension: number, mipmapped: UseMipMaps): TextureDescriptor;
}
declare namespace sd.render {
}
