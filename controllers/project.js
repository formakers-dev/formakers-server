const moment = require('moment');
const Projects = require('../models/projects');

moment.locale('ko');

const createProjectJsonFromRequest = (req) => {
    const projectJson = {};
    projectJson.customerId = req.user;
    projectJson.name = req.body.name;
    projectJson.introduce = req.body.introduce;
    projectJson.image = req.body.image;
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

const getTruncatedDate = (dateString) => {
    return moment(dateString).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
};

const getEndTimeOfTheDate = (dateString) => {
    return moment(dateString).hours(23).minutes(59).seconds(59).milliseconds(999).toDate();
};

const registerInterview = (req, res) => {
    //TODO : 추후 로케일 적용시 setHours기준 로케일 변경 필요. 현재는 서버 기준(한국시간)으로 되어있음
    const newInterview = {};

    Projects.findOne({projectId: req.params.id}).select('interviews').exec()
        .then(project => {
            console.log(req.body);
            newInterview.seq = (project && project.interviews) ? project.interviews.length + 1 : 1;

            newInterview.type = req.body.type;
            newInterview.introduce = req.body.introduce;
            newInterview.location = req.body.location;
            newInterview.locationDescription = req.body.locationDescription;
            newInterview.apps = req.body.apps;
            newInterview.interviewDate = getEndTimeOfTheDate(req.body.interviewDate);
            newInterview.openDate = getTruncatedDate(req.body.openDate);
            newInterview.closeDate = getEndTimeOfTheDate(req.body.closeDate);
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
            console.log(newInterview);
            console.log(moment.locale());
            console.log(newInterview.interviewDate.getTime());
            console.log(new Date(req.body.interviewDate));

            console.log("===moment start====");
            moment.locale('ko');
            console.log(moment(req.body.interviewDate));
            console.log(moment(req.body.interviewDate).getTime());

            moment.locale('en');
            console.log(moment(req.body.interviewDate));
            console.log(moment(req.body.interviewDate).getTime());

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