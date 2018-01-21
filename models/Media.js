const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //use built in promise off the global

const mediaSchema = new mongoose.Schema({
  adventure: {
    type: mongoose.Schema.ObjectId,
    ref: 'Adventure',
    required: 'You must supply an Adventure'
  },
  name: {
    type: String,
    trim: true,
    required: 'Please enter a trip name'
  },
  description: {
    type: String,
    trim: true
  },
  mediaType: {
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
  },
  placemarker: {
    type: mongoose.Schema.ObjectId,
    ref: 'Placemarker',
    required: 'You must supply an Placemarker'
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mediaSchema.index({
  name: 'text',
  description: 'text'
});

module.exports = mongoose.model('Media', mediaSchema);
