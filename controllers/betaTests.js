const BetaTests = require('../models/betaTests');
const Missions = require('../models/missions');

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

exports.getMissions = (req, res, next) => {
	Missions.find({
		betaTestId: req.params.testId
	}, {
		betaTestId: 1,
		title: 1,
		packageName: 1,
		actionType: 1,
		action: 1,
		options: 1,
		order: 1,
		type: 1,
	})
		.then(missions => {
			res.status(200).json(missions);
		})
		.catch(err => {
			console.error(err);
			res.sendStatus(500);
		})
}
