const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    userId : String,
    registrationToken: String,
    name : String,
});

module.exports = mongoose.model('users', usersSchema);