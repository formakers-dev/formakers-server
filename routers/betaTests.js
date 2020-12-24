const express = require('express');
const BetaTestsController = require('../controllers/betaTests');
const Auth = require('../middlewares/auth');

const router = express.Router();

router.use(Auth.verifyToken);

router
	.route('/')
	.get(BetaTestsController.getBetaTestsOfCustomer);

router
	.route('/:testId')
	.get(BetaTestsController.getInfoOfBetaTest);

router
	.route('/:testId/missions')
	.get(BetaTestsController.getMissions);

module.exports = router;
