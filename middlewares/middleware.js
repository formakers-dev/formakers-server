const Projects = require('../models/projects');

const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.sendStatus(401);
    }
};

const projectAccessAuth = (req, res, next) => {
    Projects.findOne({projectId: req.params.id, customerId: req.user}).exec()
        .then(project => {
            if (project) {
                return next();
            } else {
                res.sendStatus(401);
            }
        }).catch(() => res.sendStatus(401));
};

module.exports = {auth, projectAccessAuth};