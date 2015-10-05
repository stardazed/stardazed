/// <reference path="libzm.d.ts" />
declare function intRandom(maximum: number): number;
declare function intRandomRange(minimum: number, maximum: number): number;
declare function deg2rad(deg: number): number;
declare function rad2deg(rad: number): number;
declare function clamp(n: number, min: number, max: number): number;
declare function clamp01(n: number): number;
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
        [key: number]: boolean;
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
declare type TMXLayerSet = {
    [name: string]: TMXLayer;
};
declare class TMXData {
    layers: TMXLayerSet;
    width: number;
    height: number;
    load(filePath: string): Promise<TMXData>;
}
