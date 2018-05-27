export declare function arrayTransfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
export declare type TypedArrayConstructor = Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export declare type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
export interface ConstEnumArray8View<T extends number> extends Uint8Array {
    [index: number]: T;
}
export interface ConstEnumArray32View<T extends number> extends Int32Array {
    [index: number]: T;
}
export interface MutableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export declare type ArrayOfConstNumber = ArrayLike<number>;
export declare type ArrayOfNumber = MutableArrayLike<number>;
export declare type Float2 = ArrayOfNumber;
export declare type Float3 = ArrayOfNumber;
export declare type Float4 = ArrayOfNumber;
export declare type Float2x2 = ArrayOfNumber;
export declare type Float3x3 = ArrayOfNumber;
export declare type Float4x4 = ArrayOfNumber;
export declare type ConstFloat2 = ArrayOfConstNumber;
export declare type ConstFloat3 = ArrayOfConstNumber;
export declare type ConstFloat4 = ArrayOfConstNumber;
export declare type ConstFloat2x2 = ArrayOfConstNumber;
export declare type ConstFloat3x3 = ArrayOfConstNumber;
export declare type ConstFloat4x4 = ArrayOfConstNumber;
