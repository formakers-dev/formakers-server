const Projects = require('../models/projects');

const postProject = (req, res) => {
    const data = req.body;
    const projectId = data.projectId || Number(new Date());

    Projects.findOneAndUpdate({$and : [{projectId: projectId, customerId: data.customerId}, ]}, { $set: data }, {upsert: true})
        .exec()
        .then(() => {
            res.send(200);
        })
        .catch((err) => {
            res.send(err);
        });
};

const getProject = (req, res) => {
    const projectId = req.query.projectId;

    Projects.find({projectId: projectId}, (err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

const getAllProjects = (req, res) => {
    Projects.find((err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

module.exports = { postProject, getProject, getAllProjects};