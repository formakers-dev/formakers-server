const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config')[process.env.NODE_ENV];

router.post('/', function (req, res) {
    const key = config.firebase.serverKey;
    const registrationIds = [
        "fI2-FeMO4mA:APA91bHKGTj9es1TJAt34__LEsrLI14jauylVbL8H-hji-TxWbHo5WOiRB7RweTmG4tDcuPsiJXPDK-qh-vxe5Zz-Qlcj4A07Y_kUrpPW1O4CSwaaXUMoQBFezDffaDq7wKmkdJOjuUV"
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