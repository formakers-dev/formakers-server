const asyncHandler = require('../middlewares/asyncHandler');
const Request = require('../models/plan-b-requests');

// @desc       Create request for user matching
// @route      POST /requests
// @access     Public
exports.createRequest = asyncHandler(async(req, res, next) => {
	const request = await Request.create(req.body);

	res.status(201).json(request);
});
