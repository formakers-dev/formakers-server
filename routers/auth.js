const express = require('express');
const router = express.Router();

const Controller = require('../controllers/auth');

router.post('/sign-up', Controller.signUp);
router.post('/login', Controller.login);
router.post('/logout', Controller.logout);

module.exports = router;
