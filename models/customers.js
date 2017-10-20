const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customersSchema = new Schema({
    id: String,
    provider: String,
    name: String,
    email: String,
    providerId: String
});

module.exports = mongoose.model('customers', customersSchema);
