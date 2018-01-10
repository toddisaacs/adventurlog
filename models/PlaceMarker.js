const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const placeMarkerSchema = new mongoose.Schema({
  timestamp: {
    type: Date
  },
  title: {
    type: String,
    trim: true
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
      required: 'You must supple coordinates!'
    }]
  } 
});

placeMarkerSchema.index({
  location: '2dsphere'
});

module.exports = mongoose.model('PlaceMarker', placeMarkerSchema);