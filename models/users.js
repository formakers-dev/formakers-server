var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
  userId: String,
  provider: String,
  name: String,
  email: String
});

module.exports = mongoose.model('users', usersSchema);
