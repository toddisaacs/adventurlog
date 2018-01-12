const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //use built in promise off the global

const adventureSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a trip name'
  },
  description: {
    type: String,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an Author'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

adventureSchema.index({
  name: 'text',
  description: 'text'
});


module.exports = mongoose.model('Adventure', adventureSchema);
