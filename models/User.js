const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactValue: { type: String },  // email, mobile, or appleId
  method: { type: String }         // gmail, mobile, apple
});

module.exports = mongoose.model('User', userSchema);
