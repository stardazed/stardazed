// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

group("Deque", () => {
	test("init", () => {
		const deq = new container.Deque<number>();
		td.checkEqual(deq.count, 0);
		td.checkTrue(deq.empty);
	});
});
