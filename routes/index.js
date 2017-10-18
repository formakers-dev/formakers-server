var express = require('express');
var axios = require('axios');
var Users = require('../models/users');
var Apps = require('../models/apps');
var config = require('../config')[process.env.NODE_ENV];

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

    app.post('/message', function (req, res) {
        var key = config.firebase.serverKey;
        var registrationIds = [
            "fI2-FeMO4mA:APA91bHKGTj9es1TJAt34__LEsrLI14jauylVbL8H-hji-TxWbHo5WOiRB7RweTmG4tDcuPsiJXPDK-qh-vxe5Zz-Qlcj4A07Y_kUrpPW1O4CSwaaXUMoQBFezDffaDq7wKmkdJOjuUV"
        ];
        var notification = {
            'title': '[AppBee] 앱비에서 새로운 테스트가 도착했어요',
            'body': '테스트를 한번 확인해 보세요.',
        };
        var data = JSON.stringify({
            'notification': notification,
            'registration_ids': registrationIds
        });

        axios.post('https://fcm.googleapis.com/fcm/send', data, {
            headers: {
                'Authorization': 'key=' + key,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            console.log(response);
            res.json(true);
        }).catch(function (error) {
            console.error(error);
            res.json(false);
        });
    });

};
