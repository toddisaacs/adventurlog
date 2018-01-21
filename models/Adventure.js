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
  adventureType: {
    type: String,
    trim: true,
    default: 'Sailing'
  },
  created: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }]
  },
  endLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }]
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an Author'
  }
});
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

adventureSchema.index({
  name: 'text',
  description: 'text'
});

adventureSchema.index({
  startLocation: '2dsphere'
});



module.exports = mongoose.model('Adventure', adventureSchema);
