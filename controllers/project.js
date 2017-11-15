const Projects = require('../models/projects');
const AppUsagesController = require('../controllers/appUsages');
const NotificationController = require('../controllers/notification');
const UserController = require('../controllers/user');

const postProject = (req, res) => {
    const data = req.body;
    data.customerId = req.user;

    let projectPromise;
    if (data.projectId) {
        projectPromise = Projects.findOneAndUpdate({projectId: data.projectId}, {$set: data}, {upsert: true});
    } else {
        projectPromise = Projects.create(data);
    }

    if (data.status === "registered") {
        projectPromise
            .then(AppUsagesController.getUserIdsByPackageNames(data.apps))
            .then(result => UserController.getRegistrationIds(result))
            .then(result => NotificationController.sendNotification(result))
            .then(() => res.sendStatus(200))
            .catch((err) => {
                console.error(err);
                res.send(err)
            });
    } else {
        projectPromise
            .then(() => res.sendStatus(200))
            .catch((err) => res.send(err));
    }
};

const getProject = (req, res) => {
    const projectId = req.params.id;

    if (projectId) {
        Projects.find({$and: [{projectId: projectId}, {customerId: req.user}]}).exec()
            .then(result => res.json(result))
            .catch(err => res.status(500).json({error: err}));
    } else {
        res.sendStatus(500);
    }
};

const getAllProjects = (req, res) => {
    Projects.find({customerId: req.user}, (err, result) => {
        (err) ? res.status(500).json({error: err}) : res.json(result);
    });
};

const postInterview = (req, res) => {
    Projects.findOneAndUpdate({projectId: req.params.id}, {$set: {"interview" : req.body}}, {upsert: true})
        .exec()
        .then(() => res.json(true))
        .catch((err) => {
            console.error(err);
            res.json(false);
        });
};

module.exports = {postProject, getProject, getAllProjects, postInterview};