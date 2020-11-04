const packagejson = require('../package.json');
const express = require('express');
const index = express.Router();
const Email = require('../controllers/email');
const Landing = require('../controllers/landing');
const Middleware = require('../middlewares/middleware');
const Auth = require('../controllers/auth');
const Apps = require('../controllers/app');
const Project = require('../controllers/project');

// landing (don't have to auth)
index.get('/notices', Landing.getNotices);
index.post('/email', Email.save);

// login
index.get('/auth/google', Auth.googleAuth);
index.get('/auth/google/callback', Auth.googleAuthCallback);
index.get('/auth/login_success', Auth.loginSuccess);
index.get('/auth/login_fail', Auth.loginFail);
index.get('/auth/logout', Middleware.auth, Auth.logout);
index.get('/auth/check_login', Middleware.auth, (req, res) => res.json({username: req.user.name}));

index.get('/apps', Middleware.auth, Apps.getApps);

index.get('/projects', Middleware.auth, Project.getAllProjects);
index.post('/projects', Middleware.auth, Project.registerProject);
index.put('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.updateProject);
index.get('/projects/:id', Middleware.auth, Middleware.projectAccessAuth, Project.getProject);
index.post('/projects/:id/interviews', Middleware.auth, Middleware.projectAccessAuth, Project.registerInterview);
index.get('/projects/:id/interviews/:seq', Middleware.auth, Middleware.projectAccessAuth, Project.getInterview);
index.put('/projects/:id/interviews/:seq', Middleware.auth, Middleware.projectAccessAuth, Project.updateInterview);

index.get('/', (req, res) => {
    res.send('Hello, Plan B Customer! (' + process.env.NODE_ENV + ' v' + packagejson.version + ')');
});

module.exports = index;