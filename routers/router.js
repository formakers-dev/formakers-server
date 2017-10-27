const express = require('express');
const router = express.Router();
const Middleware = require('../middlewares/middleware');
const AuthController = require('../controllers/auth');
const NotificationController = require('../controllers/notification');
const AppsController = require('../controllers/app');
const UsersController = require('../controllers/user');
const Email = require('../controllers/email');
const Project = require('../controllers/project');

router.get('/auth/google', AuthController.googleAuth);
router.get('/auth/google/callback', AuthController.googleAuthCallback);
router.get('/auth/login_success', Middleware.auth, AuthController.loginSuccess);
router.get('/auth/login_fail', AuthController.loginFail);
router.get('/auth/logout', Middleware.auth, AuthController.logout);
router.get('/auth/check_login', Middleware.auth, (req, res) => res.send(200));

router.post('/notification', Middleware.auth, NotificationController.postNotification);

router.get('/app', Middleware.auth, AppsController.getApps);

router.get('/user/count', Middleware.auth, UsersController.getUserCount);

router.post('/email', Email.save);

router.post('/project', Middleware.auth, Project.postProject);
router.get('/project', Middleware.auth, Project.getProject);
router.get('/projects', Middleware.auth, Project.getAllProjects);

router.get('/', (req, res) => {
    res.send('Hello, AppBee Customer!');
});

module.exports = router;