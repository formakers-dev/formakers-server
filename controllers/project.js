const Projects = require('../models/projects');

const registerProject = (req, res) => {
    const data = req.body;
    data.customerId = req.user;

    Projects.create(data)
        .then(result => res.json({
            "projectId": result.projectId
        }))
        .catch(err => {
            console.log(err);
            res.send(err)
        });
};

const updateProject = (req, res) => {
    const data = req.body;
    data.customerId = req.user;

    Projects.findOneAndUpdate({projectId: req.params.id}, {$set: data}, {upsert: true})
        .then(project => res.json({
            "projectId": project.projectId
        }))
        .catch(err => {
            console.log(err);
            res.send(err)
        });
};

const getProject = (req, res) => {
    const projectId = req.params.id;

    if (projectId) {
        Projects.find({projectId: projectId}).exec()
            .then(result => res.json(result))
            .catch(err => res.status(500).json({error: err}));
    } else {
        res.sendStatus(500);
    }
};

const getAllProjects = (req, res) => {
    Projects.find({customerId: req.user}).exec()
        .then(result => res.json(result))
        .catch(err => res.status(500).json({error: err}));
};

const postInterview = (req, res) => {
    req.body.seq = new Date().getTime();

    req.body.startDate = new Date(req.body.startDate);
    req.body.endDate = new Date(req.body.endDate);
    req.body.openDate = new Date(req.body.openDate);

    const closeDate = new Date(req.body.closeDate);
    closeDate.setUTCHours(23, 59, 59, 999);
    req.body.closeDate = closeDate;

    req.body.totalCount = 5;

    Projects.findOneAndUpdate({projectId: req.params.id}, {$push: {"interviews": req.body}}, {upsert: true})
        .exec()
        .then(() => res.json(true))
        .catch((err) => {
            console.error(err);
            res.json(false);
        });
};

module.exports = {registerProject, updateProject, getProject, getAllProjects, postInterview};