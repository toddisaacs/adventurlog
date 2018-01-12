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