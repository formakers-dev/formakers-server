var cors = require('cors');
var Users = require('../models/users');
var Apps = require('../models/apps');
module.exports = function (app) {
    app.use(cors());
    app.get('/user/count', function (req, res) {
        Users.find(function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            res.json({csount: result.length});
        });
    });

    app.get('/app', function (req, res) {
        console.log(req);
        Apps.find({appName: new RegExp(req.query.keyword, "i")}, function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            res.json(result);
        })
    });

    app.post('/login', function(req, res) {
        console.log(req.body.idToken);
        console.log('어떤작업을 해야하지');
        res.json(true);
    });
};
