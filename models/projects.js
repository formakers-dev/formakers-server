const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    name: String,
    url: String
});

const ownerSchema = new Schema({
    name: String,
    image: imageSchema,
    introduce: String,
});

const interviewSchema = new Schema({
    seq: Number,
    type: String,
    introduce: String,
    location: String,
    locationDescription: String,
    apps: Array,
    openDate: Date,
    closeDate: Date,
    interviewDate: Date,
    totalCount: Number,
    timeSlot: Object,
    emergencyPhone: String,
    notifiedUserIds: Array,
    rewards: String,
});

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    image: imageSchema,
    description: String,
    descriptionImages: [imageSchema],
    interviews: [interviewSchema],
    status: String,
    owner: ownerSchema,
    videoUrl: String,
});

projectSchema.plugin(autoIncrement.plugin, {model: 'projects', field: 'projectId', startAt: 1, incrementBy: 1});

module.exports = mongoose.model('projects', projectSchema);