(function() {
	if (! inquisition) {
		throw new Exception("Inquisition library does not exist in global namespace!");
	}

	class BlanketReport {
		constructor(wrappedReport) {
			this.superReport_ = wrappedReport;
		}

		startReport() {
			blanket.setupCoverage();
			this.superReport_.startReport();
		}

		finishReport() {
			blanket.onTestsDone();
			this.superReport_.finishReport();
		}

		enterTest(test) {
			if (test.isLeaf) {
				blanket.onTestStart();
			}
			else {
				blanket.onModuleStart();
			}
			this.superReport_.enterTest(test);
		}

		leaveTest(test) {
			this.superReport_.leaveTest(test);
		}

		pass() {
			blanket.onTestDone(1, true);
			this.superReport_.pass();
		}

		skip() {
			blanket.onTestDone(1, true);
			this.superReport_.skip();
		}

		failure(msg, innerMsg) {
			blanket.onTestDone(1, false);
			this.superReport_.failure(msg, innerMsg);
		}

		error(err, innerMsg) {
			blanket.onTestDone(1, false);
			this.superReport_.error(err, innerMsg);
		}

		get result() {
			return this.superReport_.result;
		}
	}

	var oldRunAll = inquisition.runAll,
		completionResolve = null,
		theReport = null;

	inquisition.runAll = function (report) {
		theReport = new BlanketReport(report);
		const p = new Promise((resolve) => { completionResolve = resolve; });
		console.log("waiting for blanket...");
		return p;
	};
	blanket.beforeStartTestRunner({
		callback: function(){
			if (! blanket.options("existingRequireJS")){
				oldRunAll(theReport).then(() => {
					completionResolve();
				});
			}
			inquisition.runAll = oldRunAll;
		}
	});
})();
