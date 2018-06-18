import { UInt8, Double } from '@stardazed/core';
import { FixedMultiArray, fill } from '@stardazed/container';
import { vec2 } from '@stardazed/math';

/**
 * input/keyboard - keyboard input handling
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
var Key;
(function (Key) {
    Key[Key["NONE"] = 0] = "NONE";
    Key[Key["UP"] = 38] = "UP";
    Key[Key["DOWN"] = 40] = "DOWN";
    Key[Key["LEFT"] = 37] = "LEFT";
    Key[Key["RIGHT"] = 39] = "RIGHT";
    Key[Key["BACKSPACE"] = 8] = "BACKSPACE";
    Key[Key["TAB"] = 9] = "TAB";
    Key[Key["RETURN"] = 13] = "RETURN";
    Key[Key["ESC"] = 27] = "ESC";
    Key[Key["SPACE"] = 32] = "SPACE";
    Key[Key["PAGEUP"] = 33] = "PAGEUP";
    Key[Key["PAGEDOWN"] = 34] = "PAGEDOWN";
    Key[Key["HOME"] = 36] = "HOME";
    Key[Key["END"] = 35] = "END";
    Key[Key["DELETE"] = 46] = "DELETE";
    // charCode equals keyCode for A-Z
    Key[Key["A"] = "A".charCodeAt(0)] = "A";
    Key[Key["B"] = "B".charCodeAt(0)] = "B";
    Key[Key["C"] = "C".charCodeAt(0)] = "C";
    Key[Key["D"] = "D".charCodeAt(0)] = "D";
    Key[Key["E"] = "E".charCodeAt(0)] = "E";
    Key[Key["F"] = "F".charCodeAt(0)] = "F";
    Key[Key["G"] = "G".charCodeAt(0)] = "G";
    Key[Key["H"] = "H".charCodeAt(0)] = "H";
    Key[Key["I"] = "I".charCodeAt(0)] = "I";
    Key[Key["J"] = "J".charCodeAt(0)] = "J";
    Key[Key["K"] = "K".charCodeAt(0)] = "K";
    Key[Key["L"] = "L".charCodeAt(0)] = "L";
    Key[Key["M"] = "M".charCodeAt(0)] = "M";
    Key[Key["N"] = "N".charCodeAt(0)] = "N";
    Key[Key["O"] = "O".charCodeAt(0)] = "O";
    Key[Key["P"] = "P".charCodeAt(0)] = "P";
    Key[Key["Q"] = "Q".charCodeAt(0)] = "Q";
    Key[Key["R"] = "R".charCodeAt(0)] = "R";
    Key[Key["S"] = "S".charCodeAt(0)] = "S";
    Key[Key["T"] = "T".charCodeAt(0)] = "T";
    Key[Key["U"] = "U".charCodeAt(0)] = "U";
    Key[Key["V"] = "V".charCodeAt(0)] = "V";
    Key[Key["W"] = "W".charCodeAt(0)] = "W";
    Key[Key["X"] = "X".charCodeAt(0)] = "X";
    Key[Key["Y"] = "Y".charCodeAt(0)] = "Y";
    Key[Key["Z"] = "Z".charCodeAt(0)] = "Z";
})(Key || (Key = {}));
class KeyboardImpl {
    constructor() {
        const fields = [
            { type: UInt8, count: 1 },
            { type: UInt8, count: 1 },
            { type: Double, count: 1 },
        ];
        this.keyData_ = new FixedMultiArray(128, fields);
        this.downBase_ = this.keyData_.indexedFieldView(0);
        this.halfTransBase_ = this.keyData_.indexedFieldView(1);
        this.lastEventBase_ = this.keyData_.indexedFieldView(2);
        // The extra check in the key handlers for the timeStamp was added
        // after I encountered a rare, but frequently enough occuring bug
        // where, when a key is pressed for a longer time so that repeat
        // keydown events are fired, _very_ occasionally the last keydown
        // would be fired with the same timeStamp as the keyup event but
        // the event handler for that last down event was fired AFTER the
        // keyup event handler, causing the key to appear to be "stuck".
        window.addEventListener("keydown", evt => {
            const lastEvent = this.lastEventBase_[evt.keyCode];
            const wasDown = this.downBase_[evt.keyCode];
            if (lastEvent < evt.timeStamp) {
                if (!wasDown) { // ignore key repeat events
                    this.downBase_[evt.keyCode] = 1;
                    ++this.halfTransBase_[evt.keyCode];
                }
                this.lastEventBase_[evt.keyCode] = evt.timeStamp;
            }
            if (!evt.metaKey) {
                evt.preventDefault();
            }
        }, true);
        window.addEventListener("keyup", evt => {
            this.downBase_[evt.keyCode] = 0;
            ++this.halfTransBase_[evt.keyCode];
            this.lastEventBase_[evt.keyCode] = evt.timeStamp;
            evt.preventDefault();
        }, true);
    }
    keyState(kc) {
        return {
            down: !!this.downBase_[kc],
            halfTransitionCount: this.halfTransBase_[kc]
        };
    }
    down(kc) {
        return !!this.downBase_[kc];
    }
    halfTransitions(kc) {
        return this.halfTransBase_[kc];
    }
    pressed(kc) {
        return this.downBase_[kc] ? (this.halfTransBase_[kc] > 0) : false;
    }
    released(kc) {
        return !this.downBase_[kc] ? (this.halfTransBase_[kc] > 0) : false;
    }
    reset() {
        this.keyData_.clear();
    }
    resetPerFrameData() {
        fill(this.halfTransBase_, 0, this.halfTransBase_.length);
    }
}
// -- exported devices
const keyboard = new KeyboardImpl();

/**
 * input/mouse - mouse input and capture handling
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class MouseImpl {
    constructor() {
        const fields = [
            { type: UInt8, count: 1 },
            { type: UInt8, count: 1 },
        ];
        this.buttonData_ = new FixedMultiArray(16, fields);
        this.downBase_ = this.buttonData_.indexedFieldView(0);
        this.halfTransBase_ = this.buttonData_.indexedFieldView(1);
        this.position_ = [0, 0];
        this.positionDelta_ = [0, 0];
        this.wheelDelta_ = [0, 0];
        window.addEventListener("wheel", evt => {
            this.wheelDelta_[0] = evt.deltaX;
            this.wheelDelta_[1] = evt.deltaY;
            evt.preventDefault();
        }, true);
        window.addEventListener("mousedown", evt => {
            this.downBase_[evt.button] = 1;
            ++this.halfTransBase_[evt.button];
            evt.preventDefault();
        }, true);
        window.addEventListener("mouseup", evt => {
            this.downBase_[evt.button] = 0;
            ++this.halfTransBase_[evt.button];
            evt.preventDefault();
        }, true);
        window.addEventListener("contextmenu", evt => {
            // disable context menu to allow for 2nd-clicks to
            // be handled by the game.
            evt.preventDefault();
        }, true);
        window.addEventListener("mousemove", evt => {
            if (document.pointerLockElement) {
                this.positionDelta_[0] = evt.movementX;
                this.positionDelta_[1] = evt.movementY;
            }
            else {
                this.positionDelta_[0] = evt.clientX - this.position_[0];
                this.positionDelta_[1] = evt.clientY - this.position_[1];
                this.position_[0] = evt.clientX;
                this.position_[1] = evt.clientY;
            }
        }, true);
        document.addEventListener("pointerlockchange", _evt => {
            // integrate into mouse capturing logic
        });
        document.addEventListener("pointerlockerror", _evt => {
            // integrate into mouse capturing logic
        });
    }
    buttonState(index) {
        return {
            down: !!this.downBase_[index],
            halfTransitionCount: this.halfTransBase_[index]
        };
    }
    down(index) {
        return !!this.downBase_[index];
    }
    pressed(index) {
        return this.downBase_[index] ? (this.halfTransBase_[index] > 0) : false;
    }
    released(index) {
        return !this.downBase_[index] ? (this.halfTransBase_[index] > 0) : false;
    }
    halfTransitions(index) {
        return this.halfTransBase_[index];
    }
    reset() {
        this.buttonData_.clear();
        vec2.set(this.position_, 0, 0);
        vec2.set(this.positionDelta_, 0, 0);
        vec2.set(this.wheelDelta_, 0, 0);
    }
    resetPerFrameData() {
        fill(this.halfTransBase_, 0, this.halfTransBase_.length);
        this.positionDelta_[0] = 0;
        this.positionDelta_[1] = 0;
        this.wheelDelta_[0] = 0;
        this.wheelDelta_[1] = 0;
    }
    lock() {
        document.querySelector("canvas").requestPointerLock();
    }
    unlock() {
        document.exitPointerLock();
    }
    get position() {
        return this.position_.slice();
    }
    get positionDelta() {
        return this.positionDelta_.slice();
    }
    get wheelDelta() {
        return this.wheelDelta_.slice();
    }
}
// -- exported devices
const mouse = new MouseImpl();

/**
 * @stardazed/input - user input device handling
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { Key, keyboard, mouse };
//# sourceMappingURL=index.esm.js.map
