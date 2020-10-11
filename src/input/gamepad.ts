/*
input/gamepad - gamepad input handling
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

import { StructOfArrays } from "stardazed/container";
import { ButtonState } from "./types";

export const enum GPButton {
	FACE_DOWN = 0,
	FACE_RIGHT = 1,
	FACE_LEFT = 2,
	FACE_UP = 3,

	L1 = 4,
	R1 = 5,
	L2 = 6,
	R2 = 7,

	META = 8,
	OPTIONS = 9,

	L3 = 10,
	R3 = 11,

	DP_UP = 12,
	DP_DOWN = 13,
	DP_LEFT = 14,
	DP_RIGHT = 15,

	HOME = 16,
	EXTRA = 17, // non-standard

	AXIS1_HORIZ = 24,
	AXIS1_VERT = 25,
	AXIS2_HORIZ = 26,
	AXIS2_VERT = 27
}

export class Gamepads {
	private controlData_: StructOfArrays;
	private downBase_: Uint8Array;
	private halfTransBase_: Uint8Array;
	private frameToggleOffset_: number;
	private valueBase_: Float32Array;
	private names_: string[];

	constructor() {
		this.controlData_ = new StructOfArrays([
			{ type: "uint8", width: 1 },  // down
			{ type: "uint8", width: 1 },  // halfTransitionCount
			{ type: "double", width: 1 }, // value
		], 32 * 4 * 2);
		this.downBase_ = this.controlData_.fieldArrayView(0) as Uint8Array;
		this.halfTransBase_ = this.controlData_.fieldArrayView(1) as Uint8Array;
		this.valueBase_ = this.controlData_.fieldArrayView(2) as Float32Array;
		this.names_ = ["", "", "", ""];
		this.frameToggleOffset_ = 0;
	}

	poll() {
		const gamepads = navigator.getGamepads();
		let indexOffset = this.frameToggleOffset_;
		
		for (const gamepad of gamepads) {
			if (!gamepad || !gamepad.connected) {
				indexOffset += 32;
				continue;
			}

			if (gamepad.mapping === "standard") {
				for (let bix = 0; bix < gamepad.buttons.length; ++bix) {
					const button = gamepad.buttons[bix];
					this.downBase_[indexOffset + bix] = +button.pressed;
					this.valueBase_[indexOffset + bix] = button.value;
					// TODO: halfTrans counter has to be deduced from previous state (only 0 or 1)
				}
			}
			
			indexOffset += 32;
		}
	}

	gamepadName(index: number) {
		return this.names_[index];
	}

	buttonState(index: number, btn: GPButton): ButtonState {
		return {
			down: this.downBase_[this.frameToggleOffset_ + index * 32 + btn] === 1,
			halfTransitionCount: this.halfTransBase_[btn]
		};
	}

	down(index: number, btn: GPButton): boolean {
		return !!this.downBase_[this.frameToggleOffset_ + index * 32 + btn];
	}

	halfTransitions(index: number, btn: GPButton): number {
		return this.halfTransBase_[this.frameToggleOffset_ + index * 32 + btn];
	}

	pressed(index: number, btn: GPButton): boolean {
		return (this.downBase_[index * 32 + btn] === 1) && (this.halfTransBase_[index * 32 + btn] > 0);
	}

	released(index: number, btn: GPButton): boolean {
		return (this.downBase_[index * 32 + btn] === 0) && (this.halfTransBase_[index * 32 + btn] > 0);
	}

	value(index: number, btn: GPButton): number {
		return this.valueBase_[this.frameToggleOffset_ + index * 32 + btn];
	}

	reset() {
		this.controlData_.data.fill(0);
		this.frameToggleOffset_ = 0;
	}

	resetPerFrameData() {
		this.halfTransBase_.fill(0);
	}
}
