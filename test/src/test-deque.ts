import * as td from "./testdazed";

export default function dequeTests() {
	td.group("Deque", () => {
		td.test("construct", () => {
			td.checkEqual(1, 1);
		});
	});
}
