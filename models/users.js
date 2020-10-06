const mongoose = require('mongoose');

const Device = {
  manufacturer : String,
  model : String,
  osVersion : Number,
};

const userSchema = new mongoose.Schema({
  userId : String,
  name: String,
  nickName: String,
  email : String,
  birthday: Number,
  job: Number,
  gender: String,
  registrationToken: String,
  provider: String,
  providerId: String,
  lastStatsUpdateTime: Date,
  signUpTime: Date,
  activatedDate: Date,
  lifeApps: Array,
  wishList: Array,
  appVersion: String,
  device: Device,
  favoritePlatforms: Array,
  favoriteGenres: Array,
  leastFavoriteGenres: Array,
  feedbackStyles: Array,
  monthlyPayment: Number,
  userInfoUpdateVersion: Number,
});

module.exports = mongoose.model('users', userSchema);
