const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactValue: { type: String, required: true },
  method: { type: String, enum: ['gmail', 'mobile', 'apple'], required: true }
});

module.exports = mongoose.model('User', userSchema);
