const mongoose = require('mongoose');
const Adventure = mongoose.model('Adventure');
const multer = require('multer');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); // tell the Node chain we are good by passing null as first value
    } else {
      next({ message: 'That file type isn\'t allowed!' }, false);
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

exports.createAdventure =  async (req, res) => {
  const adventure = await (new Adventure(req.body)).save();
  console.log({adventure})

  res.json(adventure);
};

exports.getAdventureById = async (req, res) => {
  const adventure = await Adventure.findOne({_id: req.params.id});
  res.json(adventure);
};

exports.searchAdventures = async (req, res) => {
  const adventures = await Adventure
    // find stores that match query string
    .find({
      // searches 'text' index this is name and desctiption see model
      $text: {
        $search: req.query.q
      }
    })
    .limit(5);

  res.json(adventures);
};

exports.searchNear = async (req, res) => {
  const {type } = req.query;
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const distance = parseFloat(req.query.distance);

  console.log(coordinates);
  console.log(distance);

  const query = {
    startLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: distance
      }
    }
  }

  const adventures = await Adventure.find(query).limit(100);

  res.json(adventures);
};