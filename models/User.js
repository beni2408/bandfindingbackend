const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  instruments: [{
    type: String
  }],
  genres: [{
    type: String
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  city: {
    type: String,
    required: true
  },

  bio: {
    type: String,
    maxLength: 150
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);