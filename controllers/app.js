const Apps = require('../models/apps');

const getApps = (req, res) => {
    Apps.find({appName: new RegExp(req.query.keyword, "i")}, function (err, result) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    })
};

module.exports = { getApps };