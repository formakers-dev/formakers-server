const firebase = require('firebase');
const config = require('../config');

const firebaseConfig = config.firebase;

const save = (req, res) => {
    let data = req.body;

    if(!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    firebase.database().ref('emails').push(data, (err) => {
        if (err) {
           return res.status(500).json({error: err});
        }
        res.json(true);
    });
};

module.exports = {save};