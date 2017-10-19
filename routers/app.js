const express = require('express');
const router = express.Router();
const Apps = require('../models/apps');

router.get('/', function (req, res) {
    console.log(req);
    console.log("### query : \n" + new RegExp(req.query.keyword, "i"));
    Apps.find({appName: new RegExp(req.query.keyword, "i")}, function (err, result) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    })
});

module.exports = router;