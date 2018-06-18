/**
 * input/mouse - mouse input and capture handling
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float2 } from "@stardazed/core";
import { ButtonState } from "./common";
export declare const enum MouseControl {
    Button0 = 0,
    Button1 = 1,
    Button2 = 2,
    Button3 = 3,
    Button4 = 4,
    Button5 = 5,
    Button6 = 6,
    Button7 = 7,
    Button8 = 8,
    Button9 = 9,
    Button10 = 10,
    Button11 = 11,
    Button12 = 12,
    Button13 = 13,
    Button14 = 14,
    Button15 = 15,
    MotionHorizontal = 16,
    MotionVertical = 17,
    WheelHorizontal = 18,
    WheelVertical = 19
}
export interface Mouse {
    buttonState(index: number): ButtonState;
    down(index: number): boolean;
    pressed(index: number): boolean;
    released(index: number): boolean;
    halfTransitions(index: number): number;
    reset(): void;
    resetPerFrameData(): void;
    lock(): void;
    unlock(): void;
    readonly position: Float2;
    readonly positionDelta: Float2;
    readonly wheelDelta: Float2;
}
export declare const mouse: Mouse;
