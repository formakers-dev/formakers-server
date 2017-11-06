const Projects = require('../models/projects');
const AppUsagesController = require('../controllers/appUsages');
const NotificationController = require('../controllers/notification');

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
        projectPromise = projectPromise
            .then(() => AppUsagesController.getUserListByPackageName(data.apps[0]))
            .then((result) => NotificationController.sendNotification(result));
    }

    projectPromise
        .then(() => res.sendStatus(200))
        .catch((err) => res.send(err));
};

const getProject = (req, res) => {
    const projectId = req.query.projectId;

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

module.exports = {postProject, getProject, getAllProjects};