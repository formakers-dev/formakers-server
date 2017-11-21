const Projects = require('../models/projects');

const postProject = (req, res) => {
    const data = req.body;
    data.customerId = req.user;

    let projectPromise;
    if (data.projectId) {
        projectPromise = Projects.findOneAndUpdate({projectId: data.projectId}, {$set: data}, {upsert: true});
    } else {
        projectPromise = Projects.create(data)
            .then(result => data.projectId = result.projectId);
    }

    projectPromise
        .then(() => res.json({
            "projectId": data.projectId
        }))
        .catch(err => {
            console.log(err);
            res.send(err)
        })
};

const getProject = (req, res) => {
    const projectId = req.params.id;

    if (projectId) {
        Projects.find({$and: [{projectId: projectId}, {customerId: req.user}]}).exec()
            .then(result => {
                if (result && result.length > 0) {
                    res.json(result);
                } else {
                    res.sendStatus(204);
                }
            })
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
    req.body.seq = new Date().getTime();

    req.body.startDate = new Date(req.body.startDate);
    req.body.endDate = new Date(req.body.endDate);
    req.body.openDate = new Date(req.body.openDate);
    req.body.closeDate = new Date(req.body.closeDate);

    req.body.totalCount = 5;

    Projects.findOneAndUpdate({projectId: req.params.id}, {$push: {"interviews": req.body}}, {upsert: true})
        .exec()
        .then(() => res.json(true))
        .catch((err) => {
            console.error(err);
            res.json(false);
        });
};

module.exports = {postProject, getProject, getAllProjects, postInterview};