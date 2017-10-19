const express = require('express');
const router = express.Router();
const Users = require('../models/users');

router.get('/count', function (req, res) {
    Users.find(function (err, result) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json({count: result.length});
    });
});

module.exports = router;