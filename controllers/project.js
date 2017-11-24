const Projects = require('../models/projects');

const createProjectJsonFromRequest = (req) => {
    const projectJson = {};
    projectJson.customerId = req.user;
    projectJson.name = req.body.name;
    projectJson.introduce = req.body.introduce;
    projectJson.images = req.body.images;
    projectJson.description = req.body.description;
    projectJson.descriptionImages = req.body.descriptionImages;
    projectJson.interviews = req.body.interviews;
    projectJson.status = req.body.status;
    projectJson.owner = req.body.owner;
    projectJson.videoUrl = req.body.videoUrl;
    return projectJson;
};

const registerProject = (req, res) => {
    const newProject = createProjectJsonFromRequest(req);

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
        .then(project => res.json({
            "projectId": project.projectId
        }))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
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

const registerInterview = (req, res) => {
    const newInterview = {};

    Projects.findOne({projectId: req.params.id}).select('interviews').exec()
        .then(project => {
            newInterview.seq = (project && project.interviews) ? project.interviews.length : 0;
            newInterview.type = req.body.type;
            newInterview.location = req.body.location;
            newInterview.apps = req.body.apps;
            newInterview.interviewDate = new Date(req.body.interviewDate);
            newInterview.openDate = new Date(req.body.openDate);
            newInterview.closeDate = new Date(req.body.closeDate);
            newInterview.plans = req.body.plans;
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

module.exports = {registerProject, updateProject, getProject, getAllProjects, registerInterview};