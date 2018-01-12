const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const placeMarkerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date
  },
  velocity: {
    type: String,
    trim: true
  },
  elevation: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }]
  },
  adventure: {
    type: mongoose.Schema.ObjectId,
    ref: 'Adventure',
    required: 'You must supply an Adventure'
  }
});

placeMarkerSchema.index({
  location: '2dsphere'
});

module.exports = mongoose.model('PlaceMarker', placeMarkerSchema);