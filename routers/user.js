const express = require('express');
const router = express.Router();
const Customers = require('../models/customers');

router.get('/count', function (req, res) {
    Customers.find(function (err, result) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json({count: result.length});
    });
});

module.exports = router;