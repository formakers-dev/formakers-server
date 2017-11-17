const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    images: Array,
    description: String,
    descriptionImages: Array,
    interviews: Array,
    status: String,
    interviewer: Object
});

projectSchema.plugin(autoIncrement.plugin, {model: 'projects', field: 'projectId', startAt: 1, incrementBy: 1});

module.exports = mongoose.model('projects', projectSchema);