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
}

const enum Config {
	MAX_BUTTONS = 32,
	MAX_GAMEPADS = 4,
	STATE_ITEMS = MAX_BUTTONS * MAX_GAMEPADS
}

 // gamepad detection and normalisation

interface AxesAndButtons {
	axes: ReadonlyArray<number>;
	buttons: ReadonlyArray<GamepadButton>;
}

type Standardiser = (gamepad: Gamepad) => AxesAndButtons;

function standardGamepad(gamepad: Gamepad): AxesAndButtons {
	return { axes: gamepad.axes, buttons: gamepad.buttons };
}

function macOSWired360Gamepad(gamepad: Gamepad): AxesAndButtons {
	return { axes: gamepad.axes, buttons: gamepad.buttons };
}

function standardiserForGamepad(gamepad: Gamepad): Standardiser | undefined {
	if (gamepad.mapping === "standard") {
		return standardGamepad;
	}

	const id = gamepad.id.toLowerCase();
	// xbox(-like) wired controllers on macOS powered by the 360Controller driver
	if (id === "45e-28e-xbox 360 wired controller") {
		return macOSWired360Gamepad;
	}
	return undefined;
}

export class Gamepads {
	private controlData_: StructOfArrays;
	private downBase_: Uint8Array;
	private valueBase_: Float64Array;
	private frameToggle_: number;
	private names_: string[];
	private standardisers_: (Standardiser | undefined)[];

	private clearGamepadData(index: number) {
		this.downBase_.fill(0, index * Config.MAX_BUTTONS, (index + 1) * Config.MAX_BUTTONS);
		this.downBase_.fill(0, Config.STATE_ITEMS + index * Config.MAX_BUTTONS, Config.STATE_ITEMS + (index + 1) * Config.MAX_BUTTONS);
		this.valueBase_.fill(0, index * Config.MAX_BUTTONS, (index + 1) * Config.MAX_BUTTONS);
		this.names_[index] = "";
		this.standardisers_[index] = undefined;
	}

	private setupGamepad(gamepad: Gamepad) {
		if (gamepad.index >= Config.MAX_GAMEPADS) {
			console.warn(`A gamepad was connected at index ${gamepad.index} which is higher than Stardazed supports (max. ${Config.MAX_GAMEPADS - 1}).`);
			return;
		}
		this.clearGamepadData(gamepad.index);

		if (gamepad.mapping !== "standard") {
			const standardiser = standardiserForGamepad(gamepad);
			if (! standardiser) {
				console.warn(`A gamepad with id ${gamepad.id} was connected which is not supported.`);

			}
		}

		this.names_[gamepad.index] = gamepad.id;
	}

	constructor() {
		this.controlData_ = new StructOfArrays([
			{ type: "uint8", width: 2 },  // down
			{ type: "double", width: 1 }, // value
		], Config.MAX_BUTTONS * Config.MAX_GAMEPADS);
		this.downBase_ = this.controlData_.fieldArrayView(0) as Uint8Array;
		this.valueBase_ = this.controlData_.fieldArrayView(1) as Float64Array;
		this.frameToggle_ = 0;
		this.names_ = [];
		this.standardisers_ = [];

		// setup any already connected gamepads, just in case
		const initial = navigator.getGamepads();
		for (let gp = 0; gp < Config.MAX_GAMEPADS; ++gp) {
			const gamepad = initial[gp];
			if (gamepad) {
				 
				this.names_.push(gamepad.id);
				this.standardisers_.push(standardiserForGamepad(gamepad));
			}
			else {
				this.names_.push("");
				this.standardisers_.push(undefined);
			}

		}

		window.addEventListener("gamepadconnected", (evt) => {
			const gamepad = (evt as GamepadEvent).gamepad;
			this.setupGamepad(gamepad);
		}, true);

		window.addEventListener("gamepaddisconnected", (evt) => {
			const gamepad = (evt as GamepadEvent).gamepad;
			if (gamepad.index >= Config.MAX_GAMEPADS) {
				return;
			}
			this.clearGamepadData(gamepad.index);
		}, true);
	}

	poll() {
		const gamepads = navigator.getGamepads();
		this.frameToggle_ ^= Config.STATE_ITEMS;
		let indexOffset = this.frameToggle_;
		
		for (const gamepad of gamepads) {
			if (!gamepad || !gamepad.connected || gamepad.index >= Config.MAX_GAMEPADS) {
				indexOffset += Config.MAX_BUTTONS;
				continue;
			}

			if (gamepad.mapping === "standard") {
				for (let bix = 0; bix < gamepad.buttons.length; ++bix) {
					const button = gamepad.buttons[bix];
					this.downBase_[indexOffset + bix] = +button.pressed;
					this.valueBase_[indexOffset + bix] = button.value;
				}
			}
			
			indexOffset += Config.MAX_BUTTONS;
		}
	}

	gamepadName(index: number) {
		return this.names_[index];
	}

	getButtonStates(index: number, buttons: GPButton[]): ButtonState[] {
		return buttons.map((btn) => {
			const prev = this.downBase_[(this.frameToggle_ ^ Config.STATE_ITEMS) + index * Config.MAX_BUTTONS + btn];
			const cur = this.downBase_[this.frameToggle_ + index * Config.MAX_BUTTONS + btn];

			return {
				down: cur - prev === 1,
				transitioned: cur !== prev,
				value: this.valueBase_[this.frameToggle_ + index * Config.MAX_BUTTONS + btn]
			};
		});
	}

	up(index: number, btn: GPButton): boolean {
		return this.downBase_[this.frameToggle_ + index * Config.MAX_BUTTONS + btn] === 0;
	}

	down(index: number, btn: GPButton): boolean {
		return this.downBase_[this.frameToggle_ + index * Config.MAX_BUTTONS + btn] === 1;
	}

	pressed(index: number, btn: GPButton): boolean {
		const prevIndex = (this.frameToggle_ ^ Config.STATE_ITEMS) + index * Config.MAX_BUTTONS + btn;
		const curIndex = this.frameToggle_ + index * Config.MAX_BUTTONS + btn;
		return this.downBase_[curIndex] - this.downBase_[prevIndex] === 1;
	}

	released(index: number, btn: GPButton): boolean {
		const prevIndex = (this.frameToggle_ ^ Config.STATE_ITEMS) + index * Config.MAX_BUTTONS + btn;
		const curIndex = this.frameToggle_ + index * Config.MAX_BUTTONS + btn;
		return this.downBase_[prevIndex] - this.downBase_[curIndex] === 1;
	}

	value(index: number, btn: GPButton): number {
		return this.valueBase_[this.frameToggle_ + index * Config.MAX_BUTTONS + btn];
	}

	reset() {
		this.controlData_.data.fill(0);
		this.frameToggle_ = 0;
	}
}
