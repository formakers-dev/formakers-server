const express = require('express');
const router = express.Router();
const Middleware = require('../middlewares/middleware');
const AuthController = require('../controllers/auth');
const NotificationController = require('../controllers/notification');
const AppsController = require('../controllers/app');
const UsersController = require('../controllers/user');

router.get('/auth/google', AuthController.googleAuth);
router.get('/auth/google/callback', AuthController.googleAuthCallback);
router.get('/auth/login_success', Middleware.auth, AuthController.loginSuccess);
router.get('/auth/login_fail', AuthController.loginFail);
router.get('/auth/logout', AuthController.logout);

router.post('/notification', NotificationController.postNotification);

router.get('/app', AppsController.getApps);

router.get('/user/count', UsersController.getUserCount);

router.get('/', (req, res) => {
    res.send('Hello, AppBee Customer!');
});

module.exports = router;