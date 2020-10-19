const asyncHandler = require('../middlewares/asyncHandler');
const dataFormatter = require('../utils/dataFormatter');
const User = require('../models/users');

// @desc       Search users
// @route      POST /users/search
// @access     Public
exports.searchUsers = asyncHandler(async(req, res, next) => {
  const formattedReqBody = dataFormatter(req.body);

  const users = await User.aggregate([
    {
      $match: formattedReqBody
    },
    {
      $lookup: {
        from: "app-usages",
        let: { id: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$id", "$userId"] }
                ]
              }
            }
          },
          {
            $group: {
              _id: "$userId",
              totalUsedTime: {$sum: "$totalUsedTime"}
            }
        }],
        as: "totalPlayTime"
      }
    }
  ]);

  res.status(200).json({
    count: users.length,
    users
  });
});
