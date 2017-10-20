const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appsSchema = new Schema({
  appName: String,
  description: String,
  developer: String,
  categoryName1: String,
  categoryName2: String
});

module.exports = mongoose.model('apps', appsSchema);
