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
		feedbackAggregationUrl: 1,
	})
		.then(missions => {
			res.status(200).json(missions);
		})
		.catch(err => {
			console.error(err);
			res.sendStatus(500);
		})
}

exports.getMissionResult = (req, res, next) => {
	Missions.findOne({
		_id: req.params.missionId,
		betaTestId: req.params.testId
	}, {
		feedbackAggregationUrl: 1
	})
		.then(async result => {
			const idMatchResults = result.feedbackAggregationUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]*)[?]?.*/);
			const sheetId = idMatchResults[1];

			const GoogleSpreadsheet = require('google-spreadsheet').GoogleSpreadsheet;
			const credentials = require('../google-docs-credentials.json');
			const doc = new GoogleSpreadsheet(sheetId);

			await doc.useServiceAccountAuth(credentials);
			await doc.loadInfo();
			const sheet = doc.sheetsByIndex[1];

			// Header
			await sheet.loadHeaderRow();
			const rows = await sheet.getRows();
			const headers = sheet.headerValues
				.filter(header => header.length > 0)
				.map(header => {
					return {
						key: header,
						isOptional: rows[0][header],
						isLongText: rows[1][header],
						question: rows[2][header]
					}
				});

			const headerKeys = headers.map(header => header.key);

			// Answers
			const answerRows = await sheet.getRows({ offset: 3 });
			const answers = answerRows.map((answerRow, index) => {
				const answer = {
					order: index + 1
				};

				headerKeys.forEach(header => {
					answer[header] = answerRow[header];
				});

				return answer;
			});

			res.status(200).json({
				headers,
				headerKeys,
				answers
			});
		})
		.catch(err => {
			console.error(err);
			res.sendStatus(500);
		});
}
