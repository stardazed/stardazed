// control/mouse - mouse input and capture handling
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../tools/dom.ts" />

namespace sd.control {

	export interface Mouse {
		buttonState(index: number): ButtonState;
		down(index: number): boolean;
		pressed(index: number): boolean;
		halfTransitions(index: number): number;
		resetHalfTransitions(): void;

		readonly position: Float2;
		readonly positionDelta: Float2;
		readonly wheelDelta: Float2;
	}

	class MouseImpl implements Mouse {
		constructor() {
		}

		buttonState(_index: number): ButtonState {
			return {
				down: false,
				halfTransitionCount: 0
			};
		}

		down(_index: number) {
			return false;
		}

		pressed(_index: number) {
			return false;
		}

		halfTransitions(_index: number) {
			return 0;
		}

		resetHalfTransitions() {

		}

		get position() {
			return [0, 0];
		}

		get positionDelta() {
			return [0, 0];
		}

		get wheelDelta() {
			return [0, 0];
		}
	}

	// -- exported devices
	export const mouse: Mouse = new MouseImpl();

} // ns sd.control
