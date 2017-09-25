var Users = require('../models/users');
var Apps = require('../models/apps');
module.exports = function (app) {
    app.get('/user/count', function (req, res) {
        Users.find(function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            res.header('Access-Control-Allow-Origin', '*');
            res.json({count: result.length});
        });
    });

    app.get('/app', function (req, res) {
        console.log(req);
        Apps.find({appName: new RegExp(req.query.keyword, "i")}, function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            console.log(result);
            res.header('Access-Control-Allow-Origin', '*');
            res.json(result);
        })
    });
};
