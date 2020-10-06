const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/users');

// @desc       Search users
// @route      POST /api/users/search
// @access     Public
exports.searchUsers = asyncHandler(async(req, res, next) => {
  const users = await User.find(req.body);

  res.status(200).json({
    count: users.length,
    users
  });
});
