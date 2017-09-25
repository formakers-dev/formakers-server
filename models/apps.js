var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appsSchema = new Schema({
  appName: String,
  description: String,
  developer: String,
  categoryName1: String,
  categoryName2: String
});

module.exports = mongoose.model('apps', appsSchema);
