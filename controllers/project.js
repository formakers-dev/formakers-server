const Projects = require('../models/projects');

const createProjectJsonFromRequest = (req) => {
    const projectJson = {};
    projectJson.customerId = req.user.id;
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
        .catch(err => send500ErrorJson(err, res));
};

const updateProject = (req, res) => {
    const data = createProjectJsonFromRequest(req);

    Projects.findOneAndUpdate({projectId: req.params.id}, {
        'name': data.name,
        'introduce': data.introduce,
        'image': data.image,
        'description': data.description,
        'descriptionImages': data.descriptionImages,
        'owner': data.owner,
        'videoUrl': data.videoUrl
    })
        .then(() => res.sendStatus(200))
        .catch(err => send500ErrorJson(err, res));
};

const getProject = (req, res) => {
    const projectId = req.params.id;

    if (projectId) {
        Projects.findOne({projectId: projectId}).exec()
            .then(project => res.json(project))
            .catch(err => res.status(500).json({error: err}));
    } else {
        send500ErrorJson(null, res);
    }
};

const getAllProjects = (req, res) => {
    Projects.find({customerId: req.user.id})
        .sort({projectId: -1})
        .exec()
        .then(result => res.json(result))
        .catch(err => send500ErrorJson(err, res));
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
    interviewJson.rewards = req.body.rewards;

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
        .catch(err => send500ErrorJson(err, res));
};

const getInterview = (req, res) => {
    Projects.aggregate([
        {$match: {projectId: parseInt(req.params.id), status: 'registered'}},
        {$unwind: '$interviews'},
        {$match: {'interviews.seq': parseInt(req.params.seq)}}
    ])
        .then(interviews => {
            if (!interviews || interviews.length === 0) {
                res.sendStatus(406);
            } else {
                res.json(interviews[0]);
            }
        })
        .catch(err => send500ErrorJson(err, res));
};

const updateInterview = (req, res) => {
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const updateInterviewData = createInterviewJsonFromRequest(req);

    Projects.aggregate([
        {$match: {projectId: projectId, status: 'registered'}},
        {$unwind: '$interviews'},
        {$match: {'interviews.seq': interviewSeq}}
    ])
        .then(projects => {
            const interview = projects[0].interviews;

            if(interview.openDate < Date.now()) {
                res.sendStatus(412);
            } else {
                Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
                    {
                        'interviews.$.seq': interviewSeq,
                        'interviews.$.type': updateInterviewData.type,
                        'interviews.$.introduce': updateInterviewData.introduce,
                        'interviews.$.location': updateInterviewData.location,
                        'interviews.$.locationDescription': updateInterviewData.locationDescription,
                        'interviews.$.apps': updateInterviewData.apps,
                        'interviews.$.interviewDate': updateInterviewData.interviewDate,
                        'interviews.$.openDate': updateInterviewData.openDate,
                        'interviews.$.closeDate': updateInterviewData.closeDate,
                        'interviews.$.emergencyPhone': updateInterviewData.emergencyPhone,
                        'interviews.$.timeSlot': updateInterviewData.timeSlot,
                        'interviews.$.rewards': updateInterviewData.rewards,
                    })
                    .then(() => res.sendStatus(200))
                    .catch(err => send500ErrorJson(err, res));
            }
        })
        .catch(err => send500ErrorJson(err, res));
};

const send500ErrorJson = (err, res) => {
    console.log(err);
    res.status(500).json({error: err});
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