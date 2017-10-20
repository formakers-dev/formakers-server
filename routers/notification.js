const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');

router.post('/', function (req, res) {
    const key = config.firebase.serverKey;
    const registrationIds = [
        "e3JRra62KqQ:APA91bFmO5Nww-F7DbRHL-yK3uJ36VDN1MrTfqbdL1T4ykTNCdWW677LrsOEgQZIbPWhwYK4nB-3lCkSoQfiTY_sWB0Vz6UM3cd9h5mfND5al13xHy1YXNf8mdD5aqOM_E13qlTVNUSt"
    ];
    const notification = {
        'title': '[AppBee] 앱비에서 새로운 테스트가 도착했어요',
        'body': '테스트를 한번 확인해 보세요.',
    };
    const data = JSON.stringify({
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

module.exports = router;