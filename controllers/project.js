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

function createInterviewJsonFromRequest(req) {
    const interviewJson = {};
    interviewJson.type = req.body.type;
    interviewJson.introduce = req.body.introduce;
    interviewJson.location = req.body.location;
    interviewJson.locationDescription = req.body.locationDescription;
    interviewJson.apps = req.body.apps;
    interviewJson.interviewDate = req.body.interviewDate;
    interviewJson.openDate = req.body.openDate;
    interviewJson.closeDate = req.body.closeDate;
    interviewJson.emergencyPhone = req.body.emergencyPhone;
    interviewJson.timeSlot = {};

    const timeSlots = req.body.timeSlotTimes;

    if (timeSlots) {
        timeSlots.forEach(timeSlotTime => {
            const id = 'time' + timeSlotTime;
            interviewJson.timeSlot[id] = '';
        });
    }

    return interviewJson;
}

const registerInterview = (req, res) => {
    let newInterview;
    Projects.findOne({projectId: req.params.id}).select('interviews').exec()
        .then(project => {
            newInterview = createInterviewJsonFromRequest(req);
            newInterview.seq = (project && project.interviews) ? project.interviews.length + 1 : 1;
            newInterview.totalCount = 5;

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

const updateInterview = (req, res) => {
    const projectId = req.params.id;
    const interviewSeq = req.params.seq;
    const interview = createInterviewJsonFromRequest(req);

    //TODO : 인터뷰 모집 시작된 상태에서는 수정 불가하도록 처리
    Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
        {
            'interviews.$.seq': interviewSeq,
            'interviews.$.type': interview.type,
            'interviews.$.introduce': interview.introduce,
            'interviews.$.location': interview.location,
            'interviews.$.locationDescription': interview.locationDescription,
            'interviews.$.apps': interview.apps,
            'interviews.$.interviewDate': interview.interviewDate,
            'interviews.$.openDate': interview.openDate,
            'interviews.$.closeDate': interview.closeDate,
            'interviews.$.emergencyPhone': interview.emergencyPhone,
            'interviews.$.timeSlot': interview.timeSlot
        },
        {upsert: true})
        .then(() => res.sendStatus(200))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
};

module.exports = {
    registerProject,
    updateProject,
    getProject,
    getAllProjects,
    registerInterview,
    getInterview,
    updateInterview
};