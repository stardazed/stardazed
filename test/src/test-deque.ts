// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

function dequeTests() {
	td.group("Deque", () => {
		td.test("init", () => {
			var deq = new sd.container.Deque<number>();
			td.checkEqual(deq.count, 0);
			td.checkTrue(deq.empty);
		});
	});
}
