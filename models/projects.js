const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
    name: String,
    url: String,
    introduce: String,
});

const interviewSchema = new Schema({
    seq: Number,
    type: String,
    location: String,
    apps: Array,
    openDate: Date,
    closeDate: Date,
    interviewDate: Date,
    totalCount: Number,
    timeSlot: Object,
    emergencyPhone: String
});

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    images: Array,
    description: String,
    descriptionImages: Array,
    interviews: [interviewSchema],
    status: String,
    owner: ownerSchema,
    videoUrl: String,
});

projectSchema.plugin(autoIncrement.plugin, {model: 'projects', field: 'projectId', startAt: 1, incrementBy: 1});

module.exports = mongoose.model('projects', projectSchema);