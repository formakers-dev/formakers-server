const packagejson = require('../package.json');
const express = require('express');
const router = express.Router();
const Email = require('../controllers/email');
const Landing = require('../controllers/landing');
const Middleware = require('../middlewares/middleware');
const Auth = require('../controllers/auth');
const Apps = require('../controllers/app');
const Project = require('../controllers/project');

// landing (don't have to auth)
router.get('/notices', Landing.getNotices);
router.post('/email', Email.save);

// login
router.get('/auth/google', Auth.googleAuth);
router.get('/auth/google/callback', Auth.googleAuthCallback);
router.get('/auth/login_success', Auth.loginSuccess);
router.get('/auth/login_fail', Auth.loginFail);
router.get('/auth/logout', Middleware.auth, Auth.logout);
router.get('/auth/check_login', Middleware.auth, (req, res) => res.json({username: req.user.name}));

router.get('/apps', Middleware.auth, Apps.getApps);

router.get('/projects', Middleware.auth, Project.getAllProjects);
router.post('/projects', Middleware.auth, Project.registerProject);
router.put('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.updateProject);
router.get('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.getProject);
router.post('/projects/:id/interviews', Middleware.auth, Middleware.projectAccessAuth, Project.registerInterview);
router.get('/projects/:id/interviews/:seq', Middleware.auth, Middleware.projectAccessAuth, Project.getInterview);
router.put('/projects/:id/interviews/:seq', Middleware.auth, Middleware.projectAccessAuth, Project.updateInterview);

router.get('/', (req, res) => {
    res.send('Hello, Plan B Customer! (' + process.env.NODE_ENV + ' v' + packagejson.version + ')');
});

module.exports = router;