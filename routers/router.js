const express = require('express');
const router = express.Router();
const Middleware = require('../middlewares/middleware');
const AuthController = require('../controllers/auth');
const AppsController = require('../controllers/app');
const Email = require('../controllers/email');
const Project = require('../controllers/project');

router.get('/auth/google', AuthController.googleAuth);
router.get('/auth/google/callback', AuthController.googleAuthCallback);
router.get('/auth/login_success', Middleware.auth, AuthController.loginSuccess);
router.get('/auth/login_fail', AuthController.loginFail);
router.get('/auth/logout', Middleware.auth, AuthController.logout);
router.get('/auth/check_login', Middleware.auth, (req, res) => res.sendStatus(200));

router.get('/apps', Middleware.auth, AppsController.getApps);

router.post('/email', Email.save);

router.get('/projects', Middleware.auth, Project.getAllProjects);
router.post('/projects', Middleware.auth, Project.registerProject);
router.put('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.updateProject);
router.get('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.getProject);
router.post('/projects/:id/interviews', Middleware.auth, Middleware.projectAccessAuth, Project.registerInterview);

router.get('/', (req, res) => {
    res.send('Hello, AppBee Customer!');
});

module.exports = router;