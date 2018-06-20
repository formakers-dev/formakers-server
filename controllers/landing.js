const firebase = require('firebase');
const config = require('../config');

const firebaseConfig = config.firebase;

const getNotices = (req, res) => {
    if(!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const noticeRef = firebase.database().ref('notices');
    noticeRef.once('value', (snapshot) => {
        const array = [];

        snapshot.forEach(item => {
            array.push(item.val());
        });

        res.json(array);
    });
};

module.exports = {getNotices};