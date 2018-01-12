const Projects = require('../models/projects');
const Customers = require('../models/customers');

const auth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    Customers.findOne({id: req.user.id})
        .then(customer => {
            if (!customer.verified) {
                res.sendStatus(403);
            } else {
                return next();
            }
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });
};

const projectAccessAuth = (req, res, next) => {
    Projects.findOne({projectId: req.params.id, customerId: req.user.id})
        .then(project => {
            if (project) {
                return next();
            } else {
                res.sendStatus(401);
            }
        }).catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });
};

module.exports = {auth, projectAccessAuth};