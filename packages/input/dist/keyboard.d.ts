/**
 * input/keyboard - keyboard input handling
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ButtonState } from "./common";
export declare enum Key {
    NONE = 0,
    UP = 38,
    DOWN = 40,
    LEFT = 37,
    RIGHT = 39,
    BACKSPACE = 8,
    TAB = 9,
    RETURN = 13,
    ESC = 27,
    SPACE = 32,
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
    Z
}
export interface Keyboard {
    keyState(kc: Key): ButtonState;
    down(kc: Key): boolean;
    pressed(kc: Key): boolean;
    released(kc: Key): boolean;
    halfTransitions(kc: Key): number;
    reset(): void;
    resetPerFrameData(): void;
}
export declare const keyboard: Keyboard;
