const asyncHandler = require('../middlewares/asyncHandler');
const Request = require('../models/plan-b-requests');

const { WebClient } = require('@slack/web-api');
const config = require('../config');

// @desc       Create request for user matching
// @route      POST /requests
// @access     Public
exports.createRequest = asyncHandler(async(req, res, next) => {
	const request = await Request.create(req.body);

	const botApiToken = config.slackApiToken;
	const web = new WebClient(botApiToken);

	web.chat.postMessage({
		text: `Plan B 사이트에 새로운 요청이 들어왔습니다!! 🎉 (From ${request.customerName})`,
		channel: '_general',
		as_user: true
	});

	res.status(201).json(request);
});
