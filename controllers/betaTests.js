const BetaTests = require('../models/betaTests');

exports.getBetaTestsOfCustomer = (req, res, next) => {
	BetaTests.find({ customerId: req.userId })
		.then(betaTests => {
			if (betaTests.length > 0) {
				res.status(200).json(betaTests);
			} else {
				res.sendStatus(204);
			}
		})
		.catch(err => {
			console.error(err);
			res.sendStatus(500);
		});
}

exports.getInfoOfBetaTest = (req, res, next) => {
	BetaTests.findById(req.params.testId)
		.then(betaTest => {
			res.status(200).json(betaTest);
		})
		.catch(err => {
			console.error(err);
			res.sendStatus(500);
		});
}
