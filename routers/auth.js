const express = require('express');
const router = express.Router();

const Controller = require('../controllers/auth');
const Auth = require('../middlewares/auth');

router.post('/sign-up', Controller.signUp);
router.post('/login', Controller.login);
router.post('/logout', Auth.verifyToken, Controller.logout);

module.exports = router;
