// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

group("Deque", () => {
	test("init", () => {
		const deq = new container.Deque<number>();
		check.equal(deq.count, 0);
		check.truthy(deq.empty);
	});

	test("stuff", () => {
		check.equal(true, false, "What Is Reality?");
	});

	test("exc", () => {
		check.throws(Error, () => {
			throw "aapje";
		});
	});
});
