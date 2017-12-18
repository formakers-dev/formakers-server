const Projects = require('../models/projects');

const createProjectJsonFromRequest = (req) => {
    const projectJson = {};
    projectJson.customerId = req.user;
    projectJson.name = req.body.name;
    projectJson.introduce = req.body.introduce;
    projectJson.image = req.body.image;
    projectJson.description = req.body.description;
    projectJson.descriptionImages = req.body.descriptionImages;
    projectJson.interviews = req.body.interviews;
    projectJson.owner = req.body.owner;
    projectJson.videoUrl = req.body.videoUrl;

    return projectJson;
};

const registerProject = (req, res) => {
    const newProject = createProjectJsonFromRequest(req);
    newProject.status = 'registered';

    Projects.create(newProject)
        .then(result => res.json({
            "projectId": result.projectId
        }))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

const updateProject = (req, res) => {
    const data = createProjectJsonFromRequest(req);

    Projects.findOneAndUpdate({projectId: req.params.id}, {$set: data})
        .then(() => res.sendStatus(200))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

const getProject = (req, res) => {
    const projectId = req.params.id;

    if (projectId) {
        Projects.findOne({projectId: projectId}).exec()
            .then(project => res.json(project))
            .catch(err => res.status(500).json({error: err}));
    } else {
        res.sendStatus(500);
    }
};

const getAllProjects = (req, res) => {
    Projects.find({customerId: req.user})
        .sort({projectId: -1})
        .exec()
        .then(result => res.json(result))
        .catch(err => res.status(500).json({error: err}));
};

const registerInterview = (req, res) => {
    const newInterview = {};

    Projects.findOne({projectId: req.params.id}).select('interviews').exec()
        .then(project => {
            newInterview.seq = (project && project.interviews) ? project.interviews.length + 1 : 1;
            newInterview.type = req.body.type;
            newInterview.introduce = req.body.introduce;
            newInterview.location = req.body.location;
            newInterview.locationDescription = req.body.locationDescription;
            newInterview.apps = req.body.apps;
            newInterview.interviewDate = req.body.interviewDate;
            newInterview.openDate = req.body.openDate;
            newInterview.closeDate = req.body.closeDate;
            newInterview.emergencyPhone = req.body.emergencyPhone;
            newInterview.totalCount = 5;
            newInterview.timeSlot = {};

            const timeSlots = req.body.timeSlotTimes;

            if (timeSlots) {
                timeSlots.forEach(timeSlotTime => {
                    const id = 'time' + timeSlotTime;
                    newInterview.timeSlot[id] = '';
                });
            }

            return Projects.findOneAndUpdate({projectId: req.params.id}, {$push: {"interviews": newInterview}}, {upsert: true}).exec();
        })
        .then(() => res.json({
            "interviewSeq": newInterview.seq
        }))
        .catch((err) => {
            console.error(err);
            res.status(500).json({error: err});
        });
};

const getInterview = (req, res) => {
    Projects.aggregate([
        {$match: {projectId: parseInt(req.params.id), status: 'registered'}},
        {$unwind: '$interviews'},
        {$match: {'interviews.seq': parseInt(req.params.seq)}}
    ])
        .exec()
        .then(interviews => {
            if (!interviews || interviews.length === 0) {
                res.sendStatus(406);
                return;
            }
            res.json(interviews[0]);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
};

// TODO : updateInterview 추가 (PUT)

module.exports = {registerProject, updateProject, getProject, getAllProjects, registerInterview, getInterview};