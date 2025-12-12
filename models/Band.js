const mongoose = require('mongoose');

const bandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bandmates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  genre: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Band', bandSchema);