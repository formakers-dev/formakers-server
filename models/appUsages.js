const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appUsagesSchema = new Schema({
    packageName: String,
    users: Array,
});

module.exports = mongoose.model('app-usages', appUsagesSchema);
