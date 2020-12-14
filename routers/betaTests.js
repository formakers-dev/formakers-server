const express = require('express');
const BetaTestsController = require('../controllers/betaTests');
const Auth = require('../middlewares/auth');

const router = express.Router();

router
	.route('/')
	.get(Auth.verifyToken, BetaTestsController.getBetaTestsOfCustomer);

module.exports = router;
