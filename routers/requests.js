const express = require('express');
const { createRequest } = require('../controllers/requests');

const router = express.Router();

// ===== Requests by customer =====
router
	.route('/')
	.post(createRequest);

module.exports = router;
