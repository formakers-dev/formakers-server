const Projects = require('../models/projects');

const postProject = (req, res) => {
    const data = req.body;
    data.customerId = req.user;

    if (data.projectId) {
        Projects.findOneAndUpdate({projectId: data.projectId}, {$set: data}, {upsert: true})
            .exec()
            .then(res.sendStatus(200))
            .catch((err) => res.send(err));

    } else {
        Projects.create(data, (err) => {
            (err) ? res.send(err) : res.sendStatus(200);
        });
    }
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