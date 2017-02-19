// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("Deque", () => {
	beforeAll(() => {
		return new Promise<void>(resolve => {
			console.info("BEFORE_ALL");
			setTimeout(resolve, 100);
		});
	});

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
