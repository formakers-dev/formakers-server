const Users = require('../models/users');

const getUserCount = (req, res) => {
    Users.find(function (err, result) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json({count: result.length});
    });
};

module.exports = { getUserCount };