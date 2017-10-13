var express = require('express');
var Users = require('../models/users');
var Apps = require('../models/apps');

module.exports = function (app) {

    app.get('/user/count', function (req, res) {
        Users.find(function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            res.json({count: result.length});
        });
    });

    app.get('/app', function (req, res) {
        console.log(req);
        console.log("### query : \n" + new RegExp(req.query.keyword, "i"));
        Apps.find({appName: new RegExp(req.query.keyword, "i")}, function (err, result) {
            if (err) {
                return res.status(500).json({error: err});
            }
            res.json(result);
        })
    });
};
